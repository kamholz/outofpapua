use v5.14;
binmode STDOUT, ':encoding(utf-8)';

my @lines = read_lines();

for (my $i = 0; $i < @lines; $i++) {
  my $line = $lines[$i];

  $line =~ s/\s+$//;
  $line =~ s/\t{2,}/\t/g;
  if ($line =~ /^\t/) {
    print "\\nt " . trim($line) . "\n";
  } else {
    my ($lx, $ge, $gn) = map { trim($_) } split /\t/, $line;
    my $ps;
    if ($gn =~ s/\s*\(([^()]*)$//) {
      $ps = $1;
    }
    if ($ge =~ s/\s+\([vV]\)$//) {
      $ps = 'v' unless length $ps;
    }

    print "\n\\lx $lx\n";
    print "\\ps $ps\n" if length $ps;
    print "\\g_Eng $ge\n" if length $ge;
    print "\\g_Ind $gn\n" if length $gn;
  }
}

sub read_lines {
  open my $fh, '<:encoding(utf-8)', '../dict/Tidore.txt' or die $!;
  my @lines = <$fh>;
  close $fh;
  splice @lines, 0, 2;
  chomp @lines;
  return @lines;
}

sub trim {
  my ($txt) = @_;
  $txt =~ s/^\s+|\s+$//g;
  $txt =~ s/\s+/ /g;
  return $txt;
}