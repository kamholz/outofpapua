#!/usr/bin/env perl
use v5.14;
use Text::CSV;

my $dir = '../dict/LexiRumah';

sub parse {
  my ($path, $key, $array) = @_;

  my $csv = Text::CSV->new({ auto_diag => 1 });
  open my $fh, '<:crlf:encoding(utf-8)', $path or die $!;
  $csv->column_names($csv->getline($fh));
  my $output = {};
  while (my $row = $csv->getline_hr($fh)) {
    if ($array) {
      push @{$output->{$row->{$key}}}, $row;
    } else {
      $output->{$row->{$key}} = $row;
    }
  }
  close $fh;
  return $output;
}

my $lects = parse("$dir/lects.csv", 'ID', 0);
my $forms = parse("$dir/forms.csv", 'Source', 1);

foreach my $source (sort keys %$forms) {
  my %lect_id;
  foreach my $form (@{$forms->{$source}||[]}) {
    $lect_id{$form->{Lect_ID}} = 1;
  }
  my @found_lects = sort { $a->{ID} cmp $b->{ID} } map { $lects->{$_} } keys %lect_id;

  say "Source: $source";
  say 'Lects: ', join('; ', map { "$_->{ID} ($_->{Iso})" } @found_lects);
  print "\n";
}