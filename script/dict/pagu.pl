#!/usr/bin/env perl
use v5.14;
use utf8;
use File::Slurper qw/read_text write_text/;
use Mojo::DOM;
use Mojo::Util 'xml_escape';
binmode STDOUT, ':encoding(utf-8)';

my $dom = Mojo::DOM->new(read_text('../dict/Pagu/kamus Pagu_baru_2014[10975] reformatted.html'));

unwrap_font('font[color="#000000"]');
unwrap_font('font[face="Times New Roman, serif"]');

foreach my $font ($dom->find('font[style="font-size: 11pt"]')->each) {
  if ($font->at('i')) {
    merge_tags($font, 'font[style="font-size: 11pt"]');  
  }
}

foreach my $font ($dom->find('font[face="Times New Roman (Vietnamese), serif"]')->each) {
  merge_tags($font, 'span[lang="en-US"]');
}

$dom->find('b')->each(sub { tag($_, 'lx') });
$dom->find('font[face="Calibri, serif"]')->each(sub { tag($_, '_Eng') });
$dom->find('font[style="font-size: 11pt"]')->each(sub { tag($_, 'xv', 1) });
# $dom->find('font[face="Times New Roman, serif"]')->each(sub { tag($_, '_Ind') });

my $text = $dom->all_text =~ tr/\n\t/ /r;

my @records =
  grep { length }
  map { trim($_) }
  map { s/^\. //r } 
  split /(\[\[.+?\]\])/, $text;

foreach my $rec (@records) {
  if ($rec =~ /^\[\[(lx|_Eng|xv) (.+)\]\]$/) {
    my ($marker, $value) = ($1, $2);
    print "\n" if $marker eq 'lx';
    say "\\$marker " . trim_quotes($value);
  } else {
    say trim_quotes($rec);
  }
}

for (my $i = 0; $i < @records; $i++) {
  $records[$i] =~ tr/\x{1c3}/!/;
  if ($records[$i] =~ /^([?!]’?|’)/) {
    my $text = $1;
    $records[$i-1] =~ s/((?:\]\])?)$/$text$1/;
    $records[$i] =~ s/^([?!]’?|’)//;
  }
  if ($records[$i] =~ /‘$/ and $i+1 < @records) {
    $records[$i] =~ s/‘$//;
    $records[$i+1] =~ s/^(\[\[[a-z]+ )/$1‘/;
  }
}

@records = grep { $_ !~ /^’?\.?’?\s*$/ } @records;

sub tag {
  my ($el, $tag, $pre) = @_;
  my $text = $el->all_text;
  return if $text =~ /^\[\[/;
  $text = trim($text) unless $pre;
  if ($text eq '' or $text eq '.' or $text eq '‘') {
    $el->remove;
  } else {
    $el->replace("<span>[[$tag " . xml_escape($text) . ']]</span>');  
  }
}

sub trim {
  my ($txt) = @_;
  $txt =~ s/^\s+|\s+$//g;
  $txt =~ s/\s+/ /g;
  return $txt;
}

sub trim_quotes {
  my ($txt) = @_;
  $txt =~ s/^\.?’? ?‘? ?//;
  $txt =~ s/’? ?\.? ?‘?$//;
  return $txt;
}

sub unwrap_font {
  my ($selector) = @_;
  foreach my $font ($dom->find($selector)->each) {
    my $font2 = $font->at('font');
    if ($font2) {
      $font->replace($font2);
    }
  }
}

sub merge_tags {
  my ($tag, $selector) = @_;
  my $merged;
  my $found = $tag->previous;
  if ($found and $found->matches($selector)) {
    $merged = $found;
    $merged->content(xml_escape($merged->all_text . $tag->all_text));
  }
  $found = $tag->next;
  if ($found and $found->matches($selector)) {
    if ($merged) {
      $merged->content(xml_escape($merged->all_text . $found->all_text));
      $found->remove;
    } else {
      $merged = $found;
      $merged->content(xml_escape($tag->all_text . $merged->all_text));
    }
  }
  if ($merged) {
    $tag->remove;
  }
}