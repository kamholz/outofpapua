#!/usr/bin/env perl
use v5.14;
use lib 'perllib';
use Dotenv -load => 'app/.env';
use File::Slurper 'read_text';
use JSON::MaybeXS;
use Lexicon::Importer;
use Lexicon::Parser::Fieldworks;
use Lexicon::Parser::Flex;
use Lexicon::Parser::LexiqueDocx;
use Lexicon::Parser::Marker;
use Lexicon::Parser::Spreadsheet;
binmode STDOUT, ':encoding(utf-8)';
binmode STDERR, ':encoding(utf-8)';

if (@ARGV) {
  my $importer = Lexicon::Importer->new;
  my $dict = JSON->new->decode(read_text('dictionaries.json'));
  my $source_title = shift @ARGV;
  if (exists $dict->{$source_title}) {
    import_lexicon($source_title, $dict->{$source_title}, shift @ARGV);
  } else {
    say "Unknown source: $source_title";
  }
} else {
  say "Usage: $0 source_title";
}

sub import_lexicon {
  my ($source_title, $args, $delete_existing) = @_;
  die "no parser given" unless $args->{parser};
  die "no lang_target given" unless $args->{lang_target};
  $args->{path} = "../dict/$args->{path}";
  my $parser_class = 'Lexicon::Parser::' . delete $args->{parser};
  $importer->import_lexicon($source_title, $args->{lang_target}, $parser_class->new($args), $delete_existing);
}

1;
