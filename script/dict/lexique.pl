#!/usr/bin/env perl
use v5.14;
use utf8;
use File::Slurper 'read_text';
use Mojo::DOM;
binmode STDOUT, ':encoding(utf-8)';

my %class_to_marker = (
  DefinitionE       => 'de',
  Definitionn       => 'dn',
  Definitionr       => 'dr',
  Encyclopedicinfon => 'en',
  Encyclopedicinfor => 'er',
  Examplev          => 'xv',
  ExamplefreetransE => 'xe',
  Examplefreetransn => 'xn',
  Examplefreetransr => 'xr',
  Lexeme            => 'lx',
  Notesgeneral      => 'nt',
  Partofspeech      => 'ps',
  Reference         => 'rf',
);

my ($path) = @ARGV;
if (!$path) {
  say "Usage: $0 path";
  exit;
}

process_file($path);

sub process_file {
  my ($filename) = @_;
  my $dom = Mojo::DOM->new(read_text($path));

  # preprocessing
  foreach my $label ($dom->find('.flabel')->each) {
    $label->remove unless $label->at('b');
  }

  my $count = 0;
  foreach my $entry ($dom->find('.EntryParagraph')->each) {
    foreach my $item ($entry->find('> span')->each) {
      my $class = $item->attr('class');
      next unless $class;
      my $text = trim($item->all_text);
      say "$class = $text";
    }
    last if ++$count == 10;
  }
}

sub trim {
  my ($txt) = @_;
  $txt =~ s/\s{2,}/ /g;
  $txt =~ s/^ | $//g;
  # $txt =~ s/\x{9}//g;
  return $txt;
}