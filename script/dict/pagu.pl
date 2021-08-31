#!/usr/bin/env perl
use v5.14;
use utf8;
use File::Slurper qw/read_text write_text/;
use JSON::MaybeXS;
use Mojo::DOM;
use Mojo::Util 'xml_escape';
binmode STDOUT, ':encoding(utf-8)';

my $dom = Mojo::DOM->new(read_text('../dict/kamus Pagu_baru_2014[10975] reformatted.html'));

$dom->find('b')->each(sub { tag($_, 'lx') });
$dom->find('font[face="Calibri, serif"]')->each(sub { tag($_, 'eng') });
$dom->find('font[style="font-size: 11pt"]')->each(sub { tag($_, 'xv', 1) });
$dom->find('font[face="Times New Roman, serif"]')->each(sub { tag($_, 'ind') });

my $text = $dom->all_text =~ tr/\n\t/ /r;
my @records = grep { $_ !~ /^’?\.?\s*$/ } split /(\[\[.+?\]\])/, $text;

write_text '../dict/kamus Pagu_baru_2014[10975] tagged.json', JSON->new->pretty->indent_length(2)->encode(\@records);

my ($xv, $seen_eng_gloss);

foreach my $rec (@records) {
  $rec =~ tr/\x{1c3}/!/;

  if ($rec =~ /^\[\[([a-z]+) (.+)\]\]$/) {
    my ($marker, $value) = ($1, $2);

    if ($marker eq 'xv') {
      $xv .= $value;
    } else {
      $value = trim($value);

      if ($marker eq 'lx') {
        say "\n\\lx $value";
        $xv = '';
        $seen_eng_gloss = 0;
      } elsif ($marker eq 'eng') {
        if ($seen_eng_gloss) {
          if ($value =~ /[‘’]/) {
            ($xv, $value) = print_xv($xv, $value) if length $xv;
            say '\\xe ' . trim_quotes($value);
          } else {
            say "\\nt $value";
          }
        } else {
          $value =~ s/\.$//;
          say "\\ge $value";
          $seen_eng_gloss = 1;
        }
      } elsif ($marker eq 'ind') {
        if ($seen_eng_gloss) {
          if ($value =~ /[‘’]/) {
            ($xv, $value) = print_xv($xv, $value) if length $xv;
            say '\\xn ' . trim_quotes($value);
          } else {
            $value =~ s/^\. //;
            say "\\nt $value";          
          }
        } else {
          if (!handle_ph_gn($value)) {
            $value =~ s/\.$//;
            say "\\gn $value";          
          }
        }
      }
    }
  } else {
    $rec = trim($rec);
    if (!handle_ph_gn($rec) and $rec =~ /[‘’]/) {
      if ($rec =~ /^([^‘’]+[?!.]) (‘.+)$/) {
        $xv .= $1;
        $rec = $2;
      }
      ($xv, $rec) = print_xv($xv, $rec) if length $xv;
      say '\\xn ' . trim_quotes($rec);
    }
  }
}

sub tag {
  my ($el, $tag, $pre) = @_;
  my $text = $el->all_text;
  return if $text =~ /^\[\[/;
  $text = trim($text) unless $pre;
  if ($text eq '' or $text eq '.') {
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
  $txt =~ s/^\.? ?‘? ?//;
  $txt =~ s/’? ?\.? ?‘?$//;
  return $txt;
}

sub print_xv {
  my ($xv, $txt) = @_;
  $xv = trim($xv);
  if ($txt =~ /^([?!])/) {
    $xv .= $1;
    $txt =~ s/^.//;
  }
  $xv =~ s/\.$//;
  say "\\xv $xv";
  return (undef, $txt);
}

sub handle_ph_gn {
  my ($txt) = @_;
  $txt =~ s/\.$//;
  if ($txt =~ /^\[(.+?)\] (.+)$/) {
    say "\\ph $1";
    my $gloss = $2;
    if ($gloss =~ /^(.+)\. (.+?)$/) {
      say "\\gn $1";
      say "\\ge $2";
      $seen_eng_gloss = 1;
    } else {
      say "\\gn $gloss";
    }
    return 1;
  }
  return 0;
}