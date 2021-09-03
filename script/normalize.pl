#!/usr/bin/env perl
use v5.14;
use lib 'perllib';
use Dotenv -load => 'app/.env';
use Lexicon::Normalize;
binmode STDOUT, ':encoding(utf-8)';
binmode STDERR, ':encoding(utf-8)';

require './dictionaries.pl';
our $dict;
my $normalize = Lexicon::Normalize->new;

if (@ARGV) {
  my $source_reference = shift @ARGV;
  if (exists $dict->{$source_reference}) {
    $normalize->normalize_lexicon($source_reference, $dict->{$source_reference}{headword_normalize}, shift @ARGV);
  } else {
    say "Unknown source: $source_reference";
  }
} else {
  say "Usage: $0 source_reference";
}

1;
