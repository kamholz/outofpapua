#!/usr/bin/env perl
use v5.14;
use lib 'perllib';
use Data::Dumper;
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

my ($cmd, $source_reference, @action) = @ARGV;

if ($cmd !~ /^(?:import|parse|print_toolbox)$/ or !$source_reference) {
  print "\n";
  say "$0 import source_reference [update|overwrite]";
  say "$0 parse source_reference";
  say "$0 print_toolbox source_reference (messy)";
  print "\n";
  exit;
}

if (!exists $dict->{$source_reference}) {
  die "unknown source: $source_reference";
}

my $args = $dict->{$source_reference};
die "no parser given" unless $args->{parser};
die "no lang_target given" unless $args->{lang_target};
$args->{path} = "../dict/$args->{path}";
my $parser_class = 'Lexicon::Parser::' . delete $args->{parser};
my $parser = $parser_class->new($args);

if ($cmd eq 'import') {
  Lexicon::Importer->new->import_lexicon($source_reference, $args->{lang_target}, $parser, @action);
} elsif ($cmd eq 'parse') {
  say Dumper($parser->read_entries);
} elsif ($cmd eq 'print_toolbox') {
  $parser->print_toolbox(@action);
}

1;
