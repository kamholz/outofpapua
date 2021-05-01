#!/usr/bin/env perl
use v5.14;
use lib 'perllib';
use Data::Dumper;
use File::Slurper 'read_text';
use JSON::MaybeXS;
use Lexicon::Parser::Fieldworks;
use Lexicon::Parser::Flex;
use Lexicon::Parser::LexiqueDocx;
use Lexicon::Parser::Marker;
use Lexicon::Parser::Spreadsheet;
binmode STDOUT, ':encoding(utf-8)';
binmode STDERR, ':encoding(utf-8)';

if (@ARGV) {
  my $dict = JSON->new->decode(read_text('dictionaries.json'));
  my $source_title = shift @ARGV;
  if (exists $dict->{$source_title}) {
    parse_lexicon($source_title, $dict->{$source_title});
  } else {
    say "Unknown source: $source_title";
  }
} else {
  say "Usage: $0 source_title";
}

sub parse_lexicon {
  my ($source_title, $args) = @_;
  die "no parser given" unless $args->{parser};
  $args->{path} = "../dict/$args->{path}";
  my $parser_class = 'Lexicon::Parser::' . delete $args->{parser};
  my $parser = $parser_class->new($args);
  say Dumper($parser->read_entries);
}

1;
