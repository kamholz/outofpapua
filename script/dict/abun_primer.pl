#!/usr/bin/env perl
use v5.14;
use utf8;
use File::Slurper qw/read_text write_text/;
use JSON::MaybeXS;
use Mojo::DOM;
use Mojo::Util 'xml_escape';
binmode STDOUT, ':encoding(utf-8)';

my $dom = Mojo::DOM->new(read_text('../dict/Abun_primer_wordlist/Abun_primer_wordlist reformatted.html'));

foreach my $tr ($dom->find('tr')->each) {
  my ($lx, $g) = map { trim($_->all_text) } $tr->find('td')->each;
  my $dialect = $g =~ s/ \(Abun Ye\)$//;
  $g =~ s{/}{, }g;
  say join("\t", $lx, $g, $dialect ? 'dialect: Abun Ye' : '');
}

sub trim {
  my ($txt) = @_;
  $txt =~ s/^\s+|\s+$//g;
  $txt =~ s/\s+/ /g;
  return $txt;
}
