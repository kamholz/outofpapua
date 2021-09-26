#!/usr/bin/env perl
use v5.14;
use utf8;
use Data::Dumper;
use File::Slurper 'read_text';
use List::Util 'uniqint';
use Mojo::DOM;
binmode STDOUT, ':encoding(utf-8)';
binmode STDERR, ':encoding(utf-8)';

my $dom = Mojo::DOM->new(read_text('../dict/Kamus Indonesia-Meyah/Kamus Indonesia-Meyah-Inggris.html'));

foreach my $tr ($dom->find('tr')->each) {
  my @td = $tr->find('td')->each;
  my @counts = uniqint map { $_->find('p')->size } @td;
  if (@counts > 1) {
    my @txt = map { get($_) } @td;
    say Dumper(\@txt);
    say Dumper(\@counts);
  }
  # say Dumper(get($td[0]));
  # say "\\lx " . get($td[0]);
  # say "\\g_Ind " . get($td[1]);
  # say "\\g_Eng " . get($td[2]);
  # print "\n";
}

sub get {
  return clean_text($_[0]->all_text);
}

sub clean_text {
  my ($txt) = @_;
  $txt =~ s/\s{2,}/ /g;
  $txt =~ s/^ | $//g;
  return $txt;
}