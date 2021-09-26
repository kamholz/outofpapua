#!/usr/bin/env perl
use v5.14;
binmode STDOUT, ':encoding(utf-8)';

my @lines = read_lines();

foreach my $line (@lines) {
  next unless $line =~ /\[lx/;
  my $seen_ge = 0;
  my $note_mode = 0;
  my $note = '';

  while ($line =~ /\[([a-z]{2}) ([^][]+)\]/g) {
    my ($marker, $value) = ($1, $2);

    $note_mode = 1 if $seen_ge && $marker =~ /^g/;
    if ($note_mode) {
      $note .= $value;
    } else {
      say "\\$marker $value";
      $seen_ge = 1 if $marker eq 'ge';
    }
  }
  say "\\nt $note" if $note_mode;
  print "\n";
}

sub read_lines {
  open my $fh, '<:encoding(utf-8)', '../dict/Kamus kecil Gamkonora/Kamus kecil Gamkonora 2014 reformatted.txt' or die $!;
  my @lines = <$fh>;
  close $fh;
  chomp @lines;
  return @lines;
}

sub trim {
  my ($txt) = @_;
  $txt =~ s/^\s+|\s+$//g;
  $txt =~ s/\s+/ /g;
  return $txt;
}