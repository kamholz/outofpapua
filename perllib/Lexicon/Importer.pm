package Lexicon::Importer;
use v5.14;
use Moo;
use JSON::MaybeXS;
use namespace::clean;
use Data::Dumper;
use List::Util qw/uniqint uniqstr/;
use Mojo::Pg;
use Try::Tiny;

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

  say "\nstarting import: $source_reference";

  # key is stringified object reference
  my %seen_record_ids;

  try {
    my $db = $self->db;
    my $tx = $db->begin;

    # look for source id
    my $source_id = select_single($db, 'SELECT id FROM source WHERE reference = ?', $source_reference);
    # not found, create new source
    unless ($source_id) {
      my $lang_id = $self->get_language_id($lang_code);
      $source_id = select_single($db, 'INSERT INTO source (reference, language_id) VALUES (?, ?) RETURNING id', $source_reference, $lang_id);
      $db->query('UPDATE language SET flag_language_list = true WHERE id = ? AND NOT flag_language_list', $lang_id);
    }

    if (select_single($db, 'SELECT EXISTS (SELECT FROM entry WHERE source_id = ?)', $source_id)) {
      die 'source entries already exist, aborting' unless $action =~ /^(?:update|overwrite)$/;
      if ($action eq 'overwrite') {
        say 'deleting existing entries';
        $db->query('SELECT delete_source_entries(?)', $source_id);
      }
    }

    my $entries = $parser->read_entries;
    my (%seen_entry, @entry_ids);

    foreach my $entry (@{$entries||[]}) {
      die('empty headword in entry: ' . $json->encode($entry->{record})) unless length $entry->{headword};
      #next unless length $entry->{headword};

      my $ident = entry_identifier($entry);
      if ($seen_entry{$ident}) {
        say "skipping duplicate: $entry->{headword}";
        next;
      }
      $seen_entry{$ident} = 1;

      my $record_id = $seen_record_ids{$entry->{record}};
      unless ($record_id) {
        $record_id = select_single($db, <<'EOF', jsonify_record($entry->{record}), $entry->{page_num});
INSERT INTO record (data, page_num)
VALUES (?, ?)
RETURNING id
EOF
        $seen_record_ids{$entry->{record}} = $record_id;
      }

      $entry->{$_} = ensure_nfc($entry->{$_}) for qw/headword headword_ipa root/;

      my $entry_id = $action eq 'update' ? get_entry_id($db, $entry, $source_id) : undef;
      if ($entry_id) { # entry to replace
        $db->query(<<'EOF', $entry_id); # delete existing senses
DELETE FROM sense
USING entry
WHERE sense.entry_id = entry.id AND entry.id = ?
EOF
        $db->query(<<'EOF', map({ $entry->{$_} } qw/headword headword_ipa root/), $record_id, $entry_id);
UPDATE entry
SET headword = ?, headword_ipa = ?, root = ?, record_id = ?
WHERE id = ?
EOF
      } else {
        $entry_id = select_single($db, <<'EOF', $source_id, map({ $entry->{$_} } qw/headword headword_ipa root/), $record_id);
INSERT INTO entry (source_id, headword, headword_ipa, root, record_id)
VALUES (?, ?, ?, ?, ?)
RETURNING id
EOF
      }
      push(@entry_ids, $entry_id) if $action eq 'update';

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
          my $example_id = select_single($db, <<'EOF', $sense_id, $example_seq, $txt);
INSERT INTO sense_example (sense_id, seq, txt) VALUES (?, ?, ?)
RETURNING id
EOF
          $example_seq++;

          foreach my $tr (@trans) {
            my $language_id = $self->get_language_id($tr->[1]);
            $db->query('INSERT INTO sense_example_translation (sense_example_id, language_id, txt) VALUES (?, ?, ?)', $example_id, $language_id, $tr->[0]);
          }
        }
      }
    }

    if ($action eq 'update') {
      @entry_ids = uniqint @entry_ids;

      unless ($action2 and $action2 eq 'force') {
        my @linked = $db->query(<<'EOF', $source_id, \@entry_ids)->arrays;
SELECT entry.id, entry.headword, ed.senses
FROM entry
JOIN entry_with_details ed on ed.id = entry.id
WHERE entry.source_id = ? AND entry.id != ALL(?) AND EXISTS (SELECT FROM set_member sm WHERE sm.entry_id = entry.id)
EOF
        if (@linked) {
          print Dumper(\@linked), "\n";
          die 'aborting: would have deleted linked entries above ("update force" to override)';
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

    $tx->commit;
    say "imported successfully";
  } catch {
    say "failed: $_";
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

sub get_entry_id {
  my ($db, $entry, $source_id) = @_;
  my @glosses = uniqstr map { $_->[0] } map { @{$_->{gloss}||[]} } @{$entry->{sense}||[]};
  die "no glosses, not sure what to do: $entry->{headword}" unless @glosses;

  my @ids = map { $_->[0] } $db->query(<<'EOF', $source_id, $entry->{headword}, \@glosses)->arrays->each;
SELECT entry.id
FROM entry
JOIN sense on sense.entry_id = entry.id
JOIN sense_gloss ON sense_gloss.sense_id = sense.id
WHERE entry.source_id = ? AND entry.headword = ? AND sense_gloss.txt = ANY(?)
GROUP BY entry.id
ORDER BY count(*) DESC
LIMIT 1
EOF

  # if (@ids > 1) {
  #   die "multiple existing entry ids matched for $entry->{headword}, aborting: " . join(', ', @ids);
  # }
  return $ids[0];
}

1;
