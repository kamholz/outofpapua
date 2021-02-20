package Lexicon::Parse::XML;
use v5.14;
use Moo;
use namespace::clean;
use File::Slurper 'read_text';

extends 'Lexicon::Parse';

sub parse {
  my ($self, $path) = @_;
  my $xml = read_text($path, 'utf-8', 1);
  return Mojo::DOM->new->xml(1)->parse($xml);
}

1;
