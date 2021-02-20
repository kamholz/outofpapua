package Lexicon::Import;
use v5.14;
use Moo;
use namespace::clean;
use Mojo::Pg;

with 'Lexicon::Util';

has db_url => (
  is => 'ro',
);

has pg => (
  is => 'ro',
  lazy => 1,
  builder => sub { Mojo::Pg->new(shift->db_url) },
);

sub db {
  return self->pg->db;
}

sub import {
  my ($self, $parser) = @_;

  say "\nstarting import: $code";

  eval {
      my $rows = $parser->read_records;

      my $db = $self->db;
      my $tx = $db->begin;

      foreach my $row (@$rows) {
        next unless defined $row->{headword} && defined $row->{gloss};

        $row->{$_} = ensure_nfc($row->{$_}) for qw/headword gloss/;
        $_->[1] = ensure_nfc($_->[1]) for @{$row->{record}};

        $db->query('insert into dictionary_entry (dictionary_id, headword, gloss, record) values (?, ?, ?, ?)', $dict, $row->{headword}, $row->{gloss}, $json->encode($row->{record}));
    }

      $tx->commit;
      say "imported successfully";
  };
  say "failed: $@" if $@;
}

1;
