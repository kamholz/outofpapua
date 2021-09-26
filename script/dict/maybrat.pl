#!/usr/bin/env perl
use v5.14;
binmode STDOUT, ':encoding(utf-8)';

open my $fh, '<:encoding(utf-8)', '../dict/Dol/dol_maybrat2007.txt' or die $!;

while (<$fh>) {
  chomp;

  if (my ($lx, $rest) = /^(.+?) (\(.+)$/) {
    say "\\lx $lx";

    if (my ($ps1, $ps2, $rest1, $rest2) = $rest =~ /^\((.+?); (.+?)\) (.+?); (.+?)$/) {
      say "\\sn 1";
      parse_entry($ps1, $rest1);
      say "\\sn 2";
      parse_entry($ps2, $rest2);
    } elsif ($rest =~ /^\((.+?)\) (.+)$/) {
      parse_entry($1, $2);
    } else {
      say "no match: $lx // $_";
    }

    print "\n";
  } else {
    say "no match: $_";
  }
}

close $fh;

sub parse_entry {
  my ($ps, $rest) = @_;
  say "\\ps $ps";

  my ($nt, $gn);
  if ($rest =~ /^(.+) \((see .+?)\)$/) {
    ($rest, $nt) = ($1, $2);
  }
  if ($rest =~ /^(.+) \(Ind\. (.+?)\)$/) {
    ($rest, $gn) = ($1, $2);
  }

  say "\\g_Eng $rest";
  say "\\g_Ind $gn" if length $gn;
  say "\\nt $nt" if length $nt;
}