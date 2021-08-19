package Lexicon::Parser::HTML;
use v5.14;
use Moo;
use namespace::clean;
use File::Slurper 'read_text';
use Mojo::DOM;

extends 'Lexicon::Parser';

sub parse {
  my ($self, $path) = @_;
  my $html = read_text($path // $self->path, 'utf-8', 1);
  return Mojo::DOM->new->parse($html);
}

1;
