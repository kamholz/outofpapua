#!/usr/bin/env perl
use v5.14;
use lib 'perllib';
use Dotenv -load => 'app/.env';
use Lexicon::Importer;
use Lexicon::Parser::ACD;
use Lexicon::Parser::Dictionaria;
use Lexicon::Parser::Fieldworks;
use Lexicon::Parser::Flex;
use Lexicon::Parser::LexiqueDocx;
use Lexicon::Parser::LexiqueHTML;
use Lexicon::Parser::Marker;
use Lexicon::Parser::Spreadsheet;
binmode STDOUT, ':encoding(utf-8)';
binmode STDERR, ':encoding(utf-8)';

require './dictionaries.pl';
our $dict;
my $importer = Lexicon::Importer->new;

if (@ARGV) {
  my ($source_reference, @action) = @ARGV;
  if (exists $dict->{$source_reference}) {
    my $args = $dict->{$source_reference};
    die "no parser given" unless $args->{parser};
    die "no lang_target given" unless $args->{lang_target};
    $args->{path} = "../dict/$args->{path}";
    my $parser_class = 'Lexicon::Parser::' . delete $args->{parser};
    $importer->import_lexicon($source_reference, $args->{lang_target}, $parser_class->new($args), @action);
  } else {
    say "Unknown source: $source_reference";
  }
} else {
  say "Usage: $0 source_reference [update|overwrite]";
}

1;
