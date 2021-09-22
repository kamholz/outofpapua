#!/usr/bin/env perl
use v5.14;
use utf8;
use Data::Dumper;
use File::Slurper 'read_text';
use Mojo::DOM;
binmode STDOUT, ':encoding(utf-8)';
binmode STDERR, ':encoding(utf-8)';

my $dom = Mojo::DOM->new(read_text('../dict/Bax_final-version.html'));

my $plain10 = '[style="font-family: TimesNewRomanPSMT; font-size:10px"]';
my $italic10 = '[style="font-family: TimesNewRomanPS-ItalicMT; font-size:10px"]';
my $bold9 = '[style="font-family: TimesNewRomanPS-BoldMT; font-size:9px"]';

my $state = 'done';
my $buffer;

foreach my $span ($dom->find('span')->each) {
  my $txt = clean_text($span->all_text);
  next unless length $txt;
  next if $txt =~ /^10\d$/;
  $txt =~ s/ʧ/tʃ/g;
  say STDERR $txt;
  if ($span->matches($plain10)) {
    say STDERR 'plain10';
    my $lx;
    ($txt, $lx) = split(/\n/, $txt) if $txt =~ /\n/;
    if ($state eq 'headword') {
      if ($txt =~ /^(.+?) \[([^][]+)\]$/) {
        say "\\g_Eng $1";
        say "\\nt $2";
        $state = 'done';
        say STDERR '* headword => done';
      } elsif ($txt =~ /^(.+?) \[([^][]+)$/) {
        say "\\g_Eng $1";
        $buffer = $2;
        $state = 'note';
        say STDERR '* headword => note';
      } else {
        say "\\g_Eng $txt";
        $state = 'done';
        say STDERR '* headword => done';
      }
    } elsif ($state eq 'note') {
      if ($txt =~ /^([^][]+)\]$/) {
        say "\\nt $buffer $1";
        $buffer = '';
        $state = 'done';
        say STDERR '* note => done';
      } else {
        say STDERR "not sure how to handle plain10 in note state: $txt";
      }
    } elsif ($state eq 'done') {
      say "\n\\lx $txt";
      $state = 'headword';
      say STDERR '* done => headword (main line)';
    } else {
      say STDERR "not sure how to handle plain10 with state $state: $txt";
    }

    if (length $lx) {
      if ($state eq 'done') {
        say "\n\\lx $lx";
        say STDERR "* done => headword (next line)";
        $state = 'headword';
      } else {
        say STDERR "not sure how to handle headword on next line in $state state: $txt // $lx";
      }
    }
  } elsif ($span->matches($italic10)) {
    say STDERR 'italic10';
    if ($state eq 'headword') {
      $txt =~ s/ *\.$//;
      say "\\ps $txt";
    } elsif ($state eq 'note') {
      $buffer .= ' ' . $txt;
    }
  } elsif ($span->matches($bold9)) {
    say STDERR 'bold9';
    if ($txt =~ /^(\d+)\)$/) {
      say "\\sn $1";
      say STDERR "* $state => headword" if $state ne 'headword';
      $state = 'headword';
    } else {
      # say STDERR "not sure how to handle bold9: $txt";
    }
  }
}

sub clean_text {
  my ($txt) = @_;
  $txt =~ s/^\. //;
  $txt =~ s/^\s+|\s+$| +(?=\n)|(?<=\n) +//g;
  $txt =~ s/ {2,}/ /g;
  $txt =~ s/\n{2,}/\n/g;
  return $txt;
}