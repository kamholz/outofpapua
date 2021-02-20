package Lexicon::Parser::XML;
use v5.14;
use Moo;
use namespace::clean;
use File::Slurper 'read_text';

extends 'Lexicon::Parser';

sub parse {
  my ($self) = @_;
  my $xml = read_text($self->path, 'utf-8', 1);
  return Mojo::DOM->new->xml(1)->parse($xml);
}

1;
