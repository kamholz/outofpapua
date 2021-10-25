#!/usr/bin/env perl
use v5.14;
use utf8;
use Data::Dumper;
use File::Slurper 'read_text';
binmode STDOUT, ':encoding(utf-8)';

foreach my $record (split/\n\n/, read_text('../dict/seasite_dict_ind_2.txt', 'utf-8', 1)) {
  my $markers = parse_record($record);
  my @ge = grep { $_->[0] eq 'g_Eng' } @$markers;
  my @de = grep { $_->[0] eq 'd_Eng' } @$markers;

  if (@ge > 1 or @de > 1) {
    say "multiple glosses" if @ge > 1;
    say "multiple definitions" if @de > 1;
    say $record, "\n";
  }
}

sub parse_record {
  my ($record) = @_;
  return [ map { [ /^\\([a-zA-Z_]+) (.+)$/ ] } split /\n/, $record ];
}

sub trim {
  my ($txt) = @_;
  $txt =~ s/\s{2,}/ /g;
  $txt =~ s/^ | $//g;
  # $txt =~ s/\x{9}//g;
  return $txt;
}