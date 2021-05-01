package Lexicon::Importer;
use v5.14;
use Moo;
use JSON::MaybeXS;
use namespace::clean;
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
  my ($self, $source_title, $lang_code, $parser, $delete_existing) = @_;

  say "\nstarting import: $source_title";

  my %seen_record_ids;

  try {
    my $db = $self->db;
    my $tx = $db->begin;

    # look for source id
    my $source_id = select_single($db, 'SELECT id FROM source WHERE title = ?', $source_title);
    # not found, create new source
    unless ($source_id) {
      my $lang_id = $self->get_language_id($lang_code);
      $source_id = select_single($db, 'INSERT INTO source (title, language_id) VALUES (?, ?) RETURNING id', $source_title, $lang_id);
      $db->query('UPDATE language SET flag_language_list = true WHERE id = ? AND NOT flag_language_list', $lang_id);
    }

    if (select_single($db, 'SELECT EXISTS (SELECT FROM entry WHERE source_id = ?)', $source_id)) {
      die 'source entries already exist, aborting' unless $delete_existing;
      say 'deleting existing entries';
      $db->query('SELECT delete_source_entries(?)', $source_id);
    }

    my $entries = $parser->read_entries;

    foreach my $entry (@{$entries||[]}) {
      # if headword_citation is present, it means plain headword is the root form
      if (length $entry->{headword_citation}) {
        ($entry->{headword}, $entry->{root}) = ($entry->{headword_citation}, $entry->{headword});
      }

      die('empty headword in entry: ' . $json->encode($entry->{record})) unless length $entry->{headword};
      next unless length $entry->{headword};

      my $record_id = $seen_record_ids{$entry->{record}};
      unless ($record_id) {
        $record_id = select_single($db, <<'EOF', jsonify_record($entry->{record}));
INSERT INTO record (data)
VALUES (?)
RETURNING id
EOF
        $seen_record_ids{$entry->{record}} = $record_id;
      }

      my $entry_id = select_single($db, <<'EOF', $source_id, map({ ensure_nfc($entry->{$_}) } qw/headword headword_normalized pos root page_num/), $record_id);
INSERT INTO entry (source_id, headword, headword_normalized, pos, root, page_num, record_id)
VALUES (?, ?, ?, ?, ?, ?, ?)
RETURNING id
EOF

      foreach my $sense (@{$entry->{sense}||[]}) {
        next unless %{$sense||{}};

        my $sense_id = select_single($db, <<'EOF', $entry_id);
INSERT INTO sense (entry_id) VALUES (?)
RETURNING id
EOF

        foreach my $item (qw/gloss definition/) {
          foreach my $val (@{$sense->{$item}||[]}) {
            my $language_id = $self->get_language_id($val->[1]);
            die "no language found for gloss: $val->[0]" unless $language_id;
            $db->query("INSERT INTO sense_${item} (sense_id, language_id, txt) VALUES (?, ?, ?)",
              $sense_id, $language_id, $val->[0]);
          }
        }

        my $seq = 1;
        foreach my $ex (@{$sense->{example}||[]}) {
          my ($txt, @trans) = @$ex;
          my $example_id = select_single($db, <<'EOF', $sense_id, $seq, $txt);
INSERT INTO sense_example (sense_id, seq, txt) VALUES (?, ?, ?)
RETURNING id
EOF
          foreach my $tr (@trans) {
            my $language_id = $self->get_language_id($tr->[1]);
            $db->query('INSERT INTO sense_example_translation (sense_example_id, language_id, txt) VALUES (?, ?, ?)', $example_id, $language_id, $tr->[0]);
          }
          $seq++;
        }
      }
    }

    $tx->commit;
    say "imported successfully";
  } catch {
    say "failed: $_";
  };
}

sub jsonify_record {
  my ($record) = @_;
  return undef unless defined $record && @$record;
  return $json->encode([ map { [ $_->[0], ensure_nfc($_->[1]) ] } @$record ]);
}

sub select_single {
  my ($db, $query, @values) = @_;
  my $row = $db->query($query, @values)->array;
  return $row ? $row->[0] : undef;
}

sub get_language_id {
  my ($self, $code) = @_;
  state %language_cache;
  if (!exists $language_cache{$code}) {
    my $query = length $code == 3
      ? 'SELECT id FROM language WHERE iso6393 = ?'
      : 'SELECT l.id FROM language l JOIN iso6391 i ON (i.iso6393 = l.iso6393) WHERE i.iso6391 = ?';
    my $id = select_single($self->db, $query, $code);
    die "ISO 639 code not found: $code" unless $id;
    $language_cache{$code} = $id;
  }
  return $language_cache{$code};
}

1;
