#!/usr/bin/env perl
use v5.14;
use lib 'perllib';
use Dotenv -load => 'app/.env';
use Lexicon::IPA;
binmode STDOUT, ':encoding(utf-8)';
binmode STDERR, ':encoding(utf-8)';

require './dictionaries.pl';
our $dict;
my $ipa = Lexicon::IPA->new;

if (@ARGV) {
  my ($source_reference, $do_update) = @ARGV;
  my $source_args = $dict->{$source_reference};
  say("Unknown source: $source_reference"), exit unless $source_args;
  say("No IPA processor: $source_reference"), exit unless exists $source_args->{headword_ipa};
  $ipa->process_lexicon($source_reference, $source_args->{headword_ipa}, $do_update);
} else {
  say "Usage: $0 source_reference";
}

1;
