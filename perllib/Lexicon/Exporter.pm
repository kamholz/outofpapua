package Lexicon::Exporter;
use v5.14;
use Moo;
use namespace::clean;
use JSON::MaybeXS;
use List::Util 'uniqint';
use Mojo::Pg;

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

sub export_lexicon {
  my ($self, $source_reference, @args) = @_;

  my $db = $self->db;
  my $source_id = select_single($db, 'SELECT id FROM source WHERE reference = ?', $source_reference);
  die "source not found" unless $source_id;

  my $entries = $db->query(<<'EOF', $source_id)->hashes;
  SELECT entry.id, entry.headword, entry.senses, record.page_num
  FROM entry
  JOIN record ON record.id = entry.record_id
  WHERE entry.source_id = ?
  ORDER BY entry.headword
EOF

  $_->{senses} = $json->decode($_->{senses}) for @$entries;

  my @gloss_language_id = uniqint 
    map { $_->{language_id} }
    map { @{$_->{glosses}} }
    map { @{$_->{senses}} } @$entries;

  my $gloss_languages = $db->query(<<'EOF', \@gloss_language_id)->hashes;
  SELECT id, iso6393, name
  FROM language
  WHERE id = ANY(?)
EOF
  my %gloss_language = map { $_->{id} => { name => $_->{name}, code => ucfirst $_->{iso6393} } } @$gloss_languages;

  $self->export_entries($entries, \%gloss_language, @args);
}

sub export_entries {
  die "must be implemented by subclass";
}

1;