#!/usr/bin/env perl
use v5.14;
use lib 'perllib';
use Data::Dumper;
use Dotenv;
use Encode 'decode_utf8';
use JSON::MaybeXS;
use Lexicon::Exporter::CSV;
use Lexicon::Exporter::Marker;
use Lexicon::Importer;
use Lexicon::Parser::ACD;
use Lexicon::Parser::Dictionaria;
use Lexicon::Parser::Fieldworks;
use Lexicon::Parser::Flex;
use Lexicon::Parser::LexiRumah;
use Lexicon::Parser::LexiqueDocx;
use Lexicon::Parser::LexiqueHTML;
use Lexicon::Parser::Marker;
use Lexicon::Parser::Spreadsheet;
binmode STDOUT, ':encoding(utf-8)';
binmode STDERR, ':encoding(utf-8)';

eval {
  Dotenv->load('app/.env');
};

require './dictionaries.pl';
our $dict;

my ($cmd, $source_reference, @action) = map { decode_utf8($_, 1) } @ARGV;

if ($cmd !~ /^(?:import|parse|print_toolbox|diff_toolbox|export)$/ or !$source_reference) {
  print "\n";
  say "$0 import source_reference (update|overwrite)";
  say "$0 parse source_reference";
  say "$0 print_toolbox source_reference (messy)";
  say "$0 diff_toolbox source_reference";
  say "$0 export source_reference";
  print "\n";
  say 'environment: OOP_DICTIONARY_DIR = dictionary directory, default ../dict';
  print "\n";
  exit;
}

if ($cmd eq 'export') {
  Lexicon::Exporter::CSV->new->export_lexicon($source_reference, \*STDOUT);
} else {
  if (!exists $dict->{$source_reference}) {
    die "unknown source: $source_reference";
  }

  my $args = $dict->{$source_reference};
  die "no parser given" unless $args->{parser};
  die "no lang_target given" unless $args->{lang_target};
  my $dir = $ENV{OOP_DICTIONARY_DIR} // '../dict';
  $args->{path} = "$dir/$args->{path}";
  my $parser_class = 'Lexicon::Parser::' . delete $args->{parser};
  my $parser = $parser_class->new($args);

  if ($cmd eq 'import') {
    my $success = Lexicon::Importer->new->import_lexicon($source_reference, $args->{lang_target}, $parser, @action);
    system "cd app && script/ipa.js '$source_reference' update" if $success;
  } elsif ($cmd eq 'parse') {
    say Dumper($parser->read_entries);
  } elsif ($cmd eq 'print_toolbox') {
    my $records = $parser->get_toolbox_records(@action);
    $parser->print_toolbox_records($records, \*STDOUT);
  } elsif ($cmd eq 'diff_toolbox') {
    my $json = JSON->new;
    open my $current, '>:encoding(utf-8)', 'tmp_current_lexicon.txt' or die $!;
    open my $new, '>:encoding(utf-8)', 'tmp_new_lexicon.txt' or die $!;

    Lexicon::Exporter::Marker->new->export_lexicon($source_reference, $current);

    my $records = $parser->get_toolbox_records(@action);
    my %record_json = map { $_ => $json->encode($_) } @$records;
    $records = [ sort { $record_json{$a} cmp $record_json{$b} } @$records ];
    $parser->print_toolbox_records($records, $new);

    system 'diff', '-u', 'tmp_current_lexicon.txt', 'tmp_new_lexicon.txt';
  }
}

1;
