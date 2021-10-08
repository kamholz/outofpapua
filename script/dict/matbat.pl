#!/usr/bin/env perl
use v5.14;
use utf8;
use Data::Dumper;
use File::Slurper 'read_text';
use Mojo::DOM;
binmode STDOUT, ':encoding(utf-8)';
binmode STDERR, ':encoding(utf-8)';

my $dom = Mojo::DOM->new->xml(1)->parse(read_text('../dict/Matbat_MageyDialect_2003_Lexicography/Matbat_Vocabulary.xml'));

my $count = 0;

foreach my $page ($dom->find('page')->each) {
  my %cols;

  foreach my $textline (map { normalize_textline($_) } grep { valid_textline($_) } $page->find('textline')->each) {
    my $txt = get_text($textline);
    next if $txt eq '';

    my $first_char = $textline->at('text');
    my @bbox = split /,/, $first_char->attr('bbox');
    my $col = $bbox[0] < 120 ? 'headword' : 'entry';
    say STDERR "$bbox[1] already exists" if exists $cols{$col}{$bbox[1]};
    $cols{$col}{$bbox[1]} = $txt;
  }

  my @headword_y = sort { $b <=> $a } keys %{$cols{headword}};
  my @entry_y = sort { $b <=> $a } keys %{$cols{entry}};

  for (my $i = 0; $i < @headword_y; $i++) {
    my $headword = $cols{headword}{$headword_y[$i]};
    my $next = $i+1 < @headword_y ? $headword_y[$i+1] : 0;

    my @chunks;
    while (@entry_y and $entry_y[0] > $next) {
      push @chunks, $cols{entry}{$entry_y[0]};
      shift @entry_y;
    }

    say "\\lx $headword";
    print_entry(join(' ', @chunks));
    print "\n";
  }

}

sub normalize_textline {
  my ($textline) = @_;
  my $split = $textline->at(':not([font], :last-child)');
  if ($split) {
    return (
      Mojo::DOM->new->xml(1)->parse('<textline>' . $split->preceding_nodes->join . '</textline>'),
      Mojo::DOM->new->xml(1)->parse('<textline>' . $split->following_nodes->join . '</textline>')
    );
  }
  return $textline;
}

sub valid_textline {
  my ($textline) = @_;
  my $first_char = $textline->at('text');
  return 0 unless $first_char;
  return 0 if $first_char->attr('size') > 20 || $first_char->attr('font') eq 'Times New Roman';
  return 1;
}

sub get_text {
  my ($textline) = @_;
  my $str = '';
  foreach my $text ($textline->find('text')->each) {
    my $char = $text->text;
    $str .= $text->attr('size') < 11 ? superscript($char) : $char;
  }
  return $str =~ s/\s+$//r;
}

sub superscript {
  return $_[0] =~ tr/0123456789/⁰¹²³⁴⁵⁶⁷⁸⁹/r;
}

sub print_entry {
  my ($txt) = @_;
  $txt =~ s/ {2,}/ /g;
  # say $txt;

  my ($main, @rest) = split m{ \|\|\| }, $txt;
  if ($main =~ /^([a-z]+\.) (.+)$/) {
    say "\\ps $1";
    $main = $2;
  }

  my ($ng, $nt);
  if ($main =~ /^\(([^()]+)\) (.+)$/) {
    ($ng, $main) = ($1, $2);
  }
  if ($main =~ /^(.+?) \[([^][]+)\]$/) {
    ($main, $nt) = ($1, $2);
  }

  say "\\g_Eng $main";
  say "\\ng $ng" if length $ng;
  say "\\nt $nt" if length $nt;

  foreach my $rest (grep { length } @rest) {
    $rest =~ s/\[Σ\] //g;
    while ($rest =~ /^(.+?) ‘(.+?)’(?=[ ;]|$) *(.*?)$/) {
      my ($xv, $xe) = ($1, $2);
      $rest = $3;
      say '\\xv ' . $xv =~ s/^; //r;
      say "\\x_Eng $xe";
    }
    say "\\nt $rest" if length $rest;  
  }
}