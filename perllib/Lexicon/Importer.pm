package Lexicon::Importer;
use v5.14;
use Moo;
use JSON::MaybeXS;
use namespace::clean;
use Data::Dumper;
use List::Util qw/uniqint uniqstr/;
use Mojo::Pg;
use Text::Levenshtein 'distance';
use Try::Tiny;

my $MAX_LEVENSHTEIN_DISTANCE = 1;

my $json = JSON->new;

with 'Lexicon::Util';

has 'pg' => (
  is => 'ro',
  lazy => 1,
  builder => sub { Mojo::Pg->new },
);

sub db {
  return shift->pg->db;
}

sub import_lexicon {
  my ($self, $source_reference, $lang_code, $parser, $action, $action2) = @_;
  $action //= 'create';
  die "unknown action: $action" unless $action =~ /^(?:create|update|overwrite)$/;
  $action2 //= 'default';

  say "\nstarting import: $source_reference\n";

  # key is stringified object reference
  my %seen_record_ids;

  try {
    my $db = $self->db;
    my $tx = $db->begin;

    my $lang_id = $self->get_language_id($lang_code);
    # look for existing source
    my $source = $db->query('SELECT id, language_id FROM source WHERE reference = ?', $source_reference)->hash;
    my $source_id = $source->{id};

    if ($action2 ne 'debug') {
      if ($source_id) {
        if ($lang_id and $source->{language_id} != $lang_id) {
          $db->query('UPDATE source SET language_id = ? WHERE id = ?', $lang_id, $source_id);
          $db->query('UPDATE language SET flag_language_list = true WHERE id = ? AND NOT flag_language_list', $lang_id);
        }
      } else {
        $source_id = select_single($db, 'INSERT INTO source (reference, language_id) VALUES (?, ?) RETURNING id', $source_reference, $lang_id);
        $db->query('UPDATE language SET flag_language_list = true WHERE id = ? AND NOT flag_language_list', $lang_id);
      }

      $db->query('ALTER TABLE sense_gloss DISABLE TRIGGER update_sense_glosses');
      $db->query('ALTER TABLE sense DISABLE TRIGGER update_entry_senses');
    }

    if (select_single($db, 'SELECT EXISTS (SELECT FROM entry WHERE source_id = ?)', $source_id)) {
      die 'source entries already exist: you must specify update or overwrite' unless $action =~ /^(?:update|overwrite)$/;
      if ($action eq 'overwrite') {
        say 'deleting existing entries';
        $db->query('SELECT delete_source_entries(?)', $source_id);
      }
    }

    my $entries = $parser->read_entries;
    my (%seen_entry, %seen_entry_id, @entry_ids);

    foreach my $entry (@{$entries||[]}) {
      die('empty headword in entry: ' . $json->encode($entry->{record})) unless length $entry->{headword};
      #next unless length $entry->{headword};

      $entry->{$_} = ensure_nfc($entry->{$_}) for qw/headword headword_ipa headword_ph root/;
      foreach my $sense (@{$entry->{sense}||[]}) {
        $sense->{pos} = ensure_nfc($sense->{pos});
        foreach my $item (qw/gloss definition/) {
          foreach my $val (@{$sense->{$item}||[]}) {
            $val->[0] = ensure_nfc($val->[0]);
          }
        }
      }

      my $ident = entry_identifier($entry);
      if ($seen_entry{$ident}) {
        say "skipping duplicate: $entry->{headword}";
        next;
      }
      $seen_entry{$ident} = 1;

      my ($entry_id, $match);
      if ($action eq 'update') {
        $match = get_matching_entry($db, $entry, $source_id);
        if ($match) {
          $entry_id = $match->{id};
          if ($action2 eq 'debug') {
            say 'matched database entry:';
            print Dumper($match);
            say 'new entry:';
            print Dumper($entry), "\n";
          }
        } elsif ($action2 eq 'debug') {
          say 'warning: unmatched new entry:';
          print Dumper($entry), "\n";
        }
      }

      if ($entry_id and $seen_entry_id{$entry_id}) {
        $entry_id = undef;
        say 'warning: already matched entry, not matching it again';
        say Dumper($entry) unless $action2 eq 'debug';
      }

      next if $action2 eq 'debug';

      my $record_id = $seen_record_ids{$entry->{record}};
      unless ($record_id) {
        $record_id = select_single($db, <<'EOF', jsonify_record($entry->{record}), $entry->{page_num});
INSERT INTO record (data, page_num)
VALUES (?, ?)
RETURNING id
EOF
        $seen_record_ids{$entry->{record}} = $record_id;
      }

      if ($entry_id) { # entry to replace
        $seen_entry_id{$entry_id} = 1;
        push(@entry_ids, $entry_id);

        $db->query(<<'EOF', $entry_id); # delete existing senses
DELETE FROM sense
USING entry
WHERE sense.entry_id = entry.id AND entry.id = ?
EOF
        $db->query(<<'EOF', map({ $entry->{$_} } qw/headword headword_ipa headword_ph root/), $record_id, $entry_id);
UPDATE entry
SET headword = ?, headword_ipa = ?, headword_ph = ?, root = ?, record_id = ?
WHERE id = ?
EOF
      } else {
        $entry_id = select_single($db, <<'EOF', $source_id, map({ $entry->{$_} } qw/headword headword_ipa headword_ph root/), $record_id);
INSERT INTO entry (source_id, headword, headword_ipa, headword_ph, root, record_id)
VALUES (?, ?, ?, ?, ?, ?)
RETURNING id
EOF
      }

      my $sense_seq = 1;
      foreach my $sense (@{$entry->{sense}||[]}) {
        next unless %{$sense||{}};

        my $sense_id = select_single($db, <<'EOF', $entry_id, $sense_seq, $sense->{pos});
INSERT INTO sense (entry_id, seq, pos) VALUES (?, ?, ?)
RETURNING id
EOF
        $sense_seq++;

        foreach my $item (qw/gloss definition/) {
          my $seq = 1;
          foreach my $val (@{$sense->{$item}||[]}) {
            my $language_id = $self->get_language_id($val->[1]);
            die "no language found for gloss: $val->[0]" unless $language_id;
            $db->query("INSERT INTO sense_${item} (sense_id, language_id, txt, seq) VALUES (?, ?, ?, ?)",
              $sense_id, $language_id, $val->[0], $seq);
            $seq++;
          }
        }

        my $example_seq = 1;
        foreach my $ex (@{$sense->{example}||[]}) {
          my ($txt, @trans) = @$ex;
          my $example_id = select_single($db, <<'EOF', $sense_id, $example_seq, ensure_nfc($txt));
INSERT INTO sense_example (sense_id, seq, txt) VALUES (?, ?, ?)
RETURNING id
EOF
          $example_seq++;

          foreach my $tr (@trans) {
            my $language_id = $self->get_language_id($tr->[1]);
            $db->query('INSERT INTO sense_example_translation (sense_example_id, language_id, txt) VALUES (?, ?, ?)', $example_id, $language_id, ensure_nfc($tr->[0]));
          }
        }
      }
    }

    if ($action eq 'update') {
      @entry_ids = uniqint @entry_ids;

      if ($action2 eq 'default') { # not force or debug
        my @linked = $db->query(<<'EOF', $source_id, \@entry_ids)->arrays->each;
SELECT entry.id, entry.headword, entry.senses
FROM entry
WHERE entry.source_id = ? AND entry.id != ALL(?) AND EXISTS (SELECT FROM set_member sm WHERE sm.entry_id = entry.id)
EOF
        if (@linked) {
          print Dumper(\@linked), "\n";
          die 'aborting: would have deleted links from entries above ("update force" to override)';
        }
      }

      $db->query(<<'EOF', $source_id, \@entry_ids);
DELETE FROM sense
USING entry
WHERE sense.entry_id = entry.id AND entry.source_id = ? AND entry.id != ALL(?)
EOF
      $db->query(<<'EOF', $source_id, \@entry_ids);
DELETE FROM entry
WHERE entry.source_id = ? AND entry.id != ALL(?)
EOF
    }

    die 'debug' if $action2 eq 'debug';

    $db->query(<<'EOF', $source_id);
UPDATE sense SET glosses = sg.glosses
FROM sense_glosses sg, entry
WHERE sense.id = sg.id AND sense.entry_id = entry.id AND entry.source_id = ?
EOF
    $db->query(<<'EOF', $source_id);
UPDATE entry SET senses = es.senses
FROM entry_senses es
WHERE entry.id = es.id AND entry.source_id = ?
EOF

    $db->query('ALTER TABLE sense_gloss ENABLE TRIGGER update_sense_glosses');
    $db->query('ALTER TABLE sense ENABLE TRIGGER update_entry_senses');

    $tx->commit;
    say 'imported successfully';
    return 1;
  } catch {
    say "failed: $_" unless $_ eq 'debug';
    return 0;
  };
}

sub entry_identifier {
  my ($entry) = @_;
  my @chunks = ($entry->{headword});
  foreach my $sense (@{$entry->{sense}||[]}) {
    push @chunks, $sense->{pos} || '';
    foreach my $item (qw/gloss definition/) {
      foreach my $val (@{$sense->{$item}||[]}) {
        push @chunks, @$val;
      }
    }
  }
  return join('||', @chunks);
}

sub jsonify_record {
  my ($record) = @_;
  return undef unless defined $record && @$record;
  return $json->encode([ map { [ $_->[0], ensure_nfc($_->[1]) ] } @$record ]);
}

sub get_language_id {
  my ($self, $code) = @_;
  state %language_cache;
  if (!exists $language_cache{$code}) {
    my $query;
    if (length $code == 3) {
      $query = 'SELECT id FROM language WHERE iso6393 = ?';
    } elsif (length $code == 2) {
      $query = 'SELECT l.id FROM language l JOIN iso6391 i ON (i.iso6393 = l.iso6393) WHERE i.iso6391 = ?';
    } else {
      $query = 'SELECT id FROM language WHERE name = ?';
    }
    my $id = select_single($self->db, $query, $code);
    die "language not found: $code" unless $id;
    $language_cache{$code} = $id;
  }
  return $language_cache{$code};
}

sub get_matching_entry {
  my ($db, $entry, $source_id) = @_;

  return $entry->{id} if $entry->{id};

  my @glosses = uniqstr map { $_->[0] } map { @{$_->{gloss}||[]} } @{$entry->{sense}||[]};
  say "no glosses for entry, not sure what to do: $entry->{headword}", return unless @glosses;

  # exact headword + exact gloss
  my $match = $db->query(<<'EOF', $source_id, $entry->{headword}, \@glosses)->hash;
SELECT entry.id, entry.headword, entry.senses
FROM entry
JOIN sense on sense.entry_id = entry.id
JOIN sense_gloss ON sense_gloss.sense_id = sense.id
WHERE entry.source_id = ? AND entry.headword = ? AND sense_gloss.txt = ANY(?)
GROUP BY entry.id
ORDER BY count(*) DESC
LIMIT 1
EOF
  return $match if $match;

  # degr headword + exact gloss
  $match = $db->query(<<'EOF', $source_id, $entry->{headword}, \@glosses)->hash;
SELECT entry.id, entry.headword, entry.senses
FROM entry
JOIN sense on sense.entry_id = entry.id
JOIN sense_gloss ON sense_gloss.sense_id = sense.id
WHERE entry.source_id = ? AND entry.headword_degr = degr(?) AND sense_gloss.txt = ANY(?)
GROUP BY entry.id
ORDER BY count(*) DESC
LIMIT 1
EOF
  return $match if $match;

  # degr headword + degr gloss
  $match = $db->query(<<'EOF', $source_id, $entry->{headword}, \@glosses)->hash;
SELECT entry.id, entry.headword, entry.senses
FROM entry
JOIN sense on sense.entry_id = entry.id
JOIN sense_gloss ON sense_gloss.sense_id = sense.id
WHERE entry.source_id = ? AND entry.headword_degr = degr(?)
  AND sense_gloss.txt_degr = ANY(ARRAY(SELECT degr(unnest(?::text[]))))
GROUP BY entry.id
ORDER BY count(*) DESC
LIMIT 1
EOF
  return $match if $match;

  # Levenshtein-1 headword + exact gloss
  $match = $db->query(<<'EOF', $source_id, \@glosses)->hash;
SELECT entry.id, entry.headword, entry.senses
FROM entry
JOIN sense on sense.entry_id = entry.id
JOIN sense_gloss ON sense_gloss.sense_id = sense.id
WHERE entry.source_id = ? AND sense_gloss.txt = ANY(?)
GROUP BY entry.id
ORDER BY count(*) DESC
LIMIT 1
EOF
  return $match if $match && distance($match->{headword}, $entry->{headword}) <= $MAX_LEVENSHTEIN_DISTANCE;

  return undef;

#   my @variants = get_variants($entry);
#   if (@variants) {
#     $match = $db->query(<<'EOF', $source_id, \@variants, \@glosses)->hash;
# SELECT entry.id, entry.headword, entry.senses
# FROM entry
# JOIN sense on sense.entry_id = entry.id
# JOIN sense_gloss ON sense_gloss.sense_id = sense.id
# WHERE entry.source_id = ? AND entry.headword = ANY(?) AND sense_gloss.txt = ANY(?)
# GROUP BY entry.id
# ORDER BY count(*) DESC
# LIMIT 1
# EOF
#     return $match if $match;
#   }

#   return undef;
}

sub get_variants {
  my ($entry) = @_;
  my ($headword, @variants);

  foreach my $rec (@{$entry->{record}}) {
    my ($marker, $value) = @$rec;
    if ($marker eq 'lx' or $marker eq 'se') {
      $headword = $value;
    } elsif ($marker eq 'va') {
      push(@variants, $value) if $headword && $headword eq $entry->{headword};
    }
  }
  return @variants;
}

1;
