package Lexicon::Normalize;
use v5.14;
use Moo;
use namespace::clean;
use Mojo::Pg;
use Try::Tiny;

has 'pg' => (
  is => 'ro',
  lazy => 1,
  builder => sub { Mojo::Pg->new },
);

with 'Lexicon::Util';

sub db {
  return shift->pg->db;
}

sub normalize_lexicon {
  my ($self, $source_reference, $func, $do_update) = @_;

  say "\nstarting normalize: $source_reference";

  try {
    my $db = $self->db;
    my $tx = $db->begin;

    # look for source id
    my $source_id = select_single($db, 'SELECT id FROM source WHERE reference = ?', $source_reference);
    # not found, create new source
    unless ($source_id) {
      die 'could not find source in database';
    }

    my $count = 0;

    $db->query('SELECT id, headword FROM entry WHERE source_id = ?', $source_id)->hashes->each(sub {
      my ($entry) = @_;
      my $txt = $func->($entry->{headword});
      if ($do_update) {
        $db->query('UPDATE entry SET headword_normalized = ? WHERE id = ?', $txt, $entry->{id});
        say $count if ++$count % 100 == 0; 
      } else {
        say "$entry->{headword} => $txt";
      }
    });

    $tx->commit;

    say "normalized successfully" if $do_update;
  } catch {
    say "failed: $_";
  };
}

1;
