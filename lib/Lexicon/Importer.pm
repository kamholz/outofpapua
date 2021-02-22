package Lexicon::Importer;
use v5.14;
use Moo;
use JSON::MaybeXS;
use namespace::clean;
use Mojo::Pg;
use Try::Tiny;

my $json = JSON->new;

with 'Lexicon::Util';

has db_url => (
  is => 'ro',
);

has pg => (
  is => 'ro',
  lazy => 1,
  builder => sub { Mojo::Pg->new(shift->db_url) },
);

has iso_corrected => (
  is => 'ro',
  default => sub { {
    en => 'eng',
  } },
);

sub db {
  return shift->pg->db;
}

sub import_lexicon {
  my ($self, $source_title, $parser) = @_;

  say "\nstarting import: $source_title";

  try {
    my $db = $self->db;
    my $tx = $db->begin;

    # look for source id
    my $source_id = $db->query('SELECT id FROM source WHERE title = ?', $source_title)->array->[0];
    # not found, create new source
    unless ($source_id) {
      $source_id = $db->query('INSERT INTO source (title) VALUES (?) RETURNING id', $source_title)->array->[0];
    }

    die 'source entries already exist, aborting'
      if $db->query('SELECT EXISTS (SELECT FROM entry WHERE source_id = ?)', $source_id)->array->[0];

    my $entries = $parser->read_entries;

    foreach my $entry (@{$entries||[]}) {
      die('empty headword in entry: ' . $json->encode($entry->{record})) unless length $entry->{headword};
      next unless length $entry->{headword};

      my $entry_id = $db->query(<<'EOF', $source_id, map { ensure_nfc($entry->{$_}) } qw/headword headword_normalized pos root/, jsonify_record($entry->{record}))->array->[0];
INSERT INTO entry (source_id, headword, headword_normalized, pos, root, data)
VALUES (?, ?, ?, ?, ?, ?)
RETURING id
EOF

      foreach my $sense (@{$entry->{sense}||[]}) {
        next unless %{$sense||{}};

        my $sense_id = $db->query(<<'EOF', $entry_id)->array->[0];
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

sub get_language_id {
  my ($self, $iso6393) = @_;
  state $iso_corrected = $self->iso_corrected;
  state %language_cache;
  $iso6393 = $iso_corrected->{$iso6393} // $iso6393;
  if (!exists $language_cache{$iso6393}) {
    $language_cache{$iso6393} = $self->db->query('SELECT id FROM language WHERE iso6393 = ?', $iso6393)->array->[0];
  }
  return $language_cache{$iso6393};
}

1;
