package Lexicon::IPA;
use v5.14;
use Moo;
use namespace::clean;
use Mojo::Pg;
use Try::Tiny;
use Unicode::Normalize 'NFD';

has 'pg' => (
  is => 'ro',
  lazy => 1,
  builder => sub { Mojo::Pg->new },
);

with 'Lexicon::Util';

sub db {
  return shift->pg->db;
}

sub process_lexicon {
  my ($self, $source_reference, $func, $do_update) = @_;

  say "\nstarting: $source_reference\n";

  try {
    my $db = $self->db;
    my $tx = $db->begin;

    # look for source id
    my $source_id = select_single($db, 'SELECT id FROM source WHERE reference = ?', $source_reference);
    # not found, create new source
    unless ($source_id) {
      die 'could not find source in database';
    }

    $db->query(<<'EOF', $source_id)->hashes->each(sub {
SELECT id, headword, headword_ph 
FROM entry_with_ph
WHERE source_id = ?
EOF
      my ($entry) = @_;
      my $ph = match_headword_ph($entry->{headword}, $entry->{headword_ph});
      my $txt = $func->(NFD($ph));
      if ($do_update) {
        $db->query('UPDATE entry SET headword_ipa = ? WHERE id = ?', $txt, $entry->{id});
      } else {
        say "$entry->{headword} => $txt";
      }
    });

    $tx->commit;

    say "processed successfully" if $do_update;
  } catch {
    say "failed: $_";
  };
}

sub match_headword_ph {
  my ($headword, $headword_ph) = @_;
  return $headword unless defined $headword_ph;
  return $headword_ph unless $headword_ph =~ /[,;]/;

  foreach my $ph (split(split_regex(',;'), $headword_ph)) {
    my $ph_nfd = NFD($ph);
    $ph_nfd =~ s/\p{M}//g; # strip accents
    if ($ph_nfd eq $headword) {
      return $ph;
    }
  }
  warn "could not identify headword, returning all: $headword_ph";
  return $headword_ph;
}

1;
