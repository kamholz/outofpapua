#!/usr/bin/env perl
use v5.14;
use lib 'perllib';
use Data::Dumper;
use File::Slurper 'read_text';
use JSON::MaybeXS;
use Lexicon::Parser::ACD;
use Lexicon::Parser::Fieldworks;
use Lexicon::Parser::Flex;
use Lexicon::Parser::LexiqueDocx;
use Lexicon::Parser::LexiqueHTML;
use Lexicon::Parser::Marker;
use Lexicon::Parser::Spreadsheet;
require './dictionaries.pl';
binmode STDOUT, ':encoding(utf-8)';
binmode STDERR, ':encoding(utf-8)';

if (@ARGV) {
  my $dict = JSON->new->decode(read_text('dictionaries.json'));
  my $source_reference = shift @ARGV;
  if (exists $dict->{$source_reference}) {
    add_perl_attr($dict, $source_reference);
    parse_lexicon($source_reference, $dict->{$source_reference});
  } else {
    say "Unknown source: $source_reference";
  }
} else {
  say "Usage: $0 source_reference";
}

sub parse_lexicon {
  my ($source_reference, $args) = @_;
  die "no parser given" unless $args->{parser};
  $args->{path} = "../dict/$args->{path}";
  my $parser_class = 'Lexicon::Parser::' . delete $args->{parser};
  my $parser = $parser_class->new($args);
  say Dumper($parser->read_entries);
}

1;
