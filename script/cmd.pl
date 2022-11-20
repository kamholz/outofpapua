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

local $Data::Dumper::Terse = 1;
local $Data::Dumper::Sortkeys = 1;
local $Data::Dumper::Useperl = 1;

eval { # silently fail if not present
  Dotenv->load('app/.env');
};

require './dictionaries.pl';
our $dict;

my ($cmd, $reference, @action) = map { decode_utf8($_, 1) } @ARGV;

if ($cmd !~ /^(?:delete_ipa_lib|delete_ipa_ruleset|delete_source|diff_toolbox|export|import|parse|print_toolbox|update_source_language)$/ or !$reference) {
  print "\n";
  say "$0 delete_ipa_lib ipa_lib";
  say "$0 delete_ipa_ruleset ipa_ruleset";
  say "$0 delete_source source_reference";
  say "$0 diff_toolbox source_reference";
  say "$0 export source_reference";
  say "$0 import source_reference [update|overwrite] [force|debug]";
  say "$0 parse source_reference";
  say "$0 print_toolbox source_reference [messy]";
  say "$0 update_source_language source_reference code|name";
  print "\n";
  say 'environment: OOP_DICTIONARY_DIR = dictionary directory, default ../dict';
  print "\n";
  exit;
}

if ($cmd eq 'export') {
  Lexicon::Exporter::CSV->new->export_lexicon($reference, \*STDOUT);
} elsif ($cmd eq 'update_source_language') {
  my ($lang_code) = @action;
  die "no language code or name given" unless $lang_code;
  Lexicon::Importer->new->update_source_language($reference, $lang_code);
} elsif ($cmd eq 'delete_ipa_lib') {
  Lexicon::Importer->new->delete_ipa_lib($reference);
} elsif ($cmd eq 'delete_ipa_ruleset') {
  Lexicon::Importer->new->delete_ipa_ruleset($reference);
} elsif ($cmd eq 'delete_source') {
  Lexicon::Importer->new->delete_source($reference);
} else {
  if (!exists $dict->{$reference}) {
    die "unknown source: $reference";
  }

  my $args = $dict->{$reference};
  die "no parser given" unless $args->{parser};
  die "no lang_target given" unless $args->{lang_target};
  my $dir = $ENV{OOP_DICTIONARY_DIR} // '../dict';
  $args->{path} = "$dir/$args->{path}";
  my $parser_class = 'Lexicon::Parser::' . delete $args->{parser};
  my $parser = $parser_class->new($args);

  if ($cmd eq 'import') {
    my $success = Lexicon::Importer->new->import_lexicon($reference, $args->{lang_target}, $parser, @action);
    system "cd app && script/ipa.js '$reference' update" if $success;
  } elsif ($cmd eq 'parse') {
    say Dumper($parser->read_entries);
  } elsif ($cmd eq 'print_toolbox') {
    my $records = $parser->get_toolbox_records(@action);
    $parser->print_toolbox_records($records, \*STDOUT);
  } elsif ($cmd eq 'diff_toolbox') {
    my $json = JSON->new;
    open my $current, '>:encoding(utf-8)', 'tmp_current_lexicon.txt' or die $!;
    open my $new, '>:encoding(utf-8)', 'tmp_new_lexicon.txt' or die $!;

    Lexicon::Exporter::Marker->new->export_lexicon($reference, $current);

    my $records = $parser->get_toolbox_records(@action);
    my %record_json = map { $_ => $json->encode($_) } @$records;
    $records = [ sort { $record_json{$a} cmp $record_json{$b} } @$records ];
    $parser->print_toolbox_records($records, $new);

    system 'diff', '-u', 'tmp_current_lexicon.txt', 'tmp_new_lexicon.txt';
  }
}

1;
