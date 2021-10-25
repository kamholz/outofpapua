#!/usr/bin/env perl
use v5.14;
use utf8;
use File::Slurper 'read_text';
use Mojo::DOM;
use Mojo::Util 'xml_escape';
binmode STDOUT, ':encoding(utf-8)';

process_file($_) for ('TernatewdlA-D.html');

sub process_file {
  my ($filename) = @_;
  my $dom = Mojo::DOM->new(read_text("../dict/Berts Ternate dictionary/$filename"));

  my $rest;

  foreach my $p ($dom->find('p[lang="en-GB"]')->each) {
    my @fonts = $p->find('font')->each;
    my $headword = $fonts[0]->at('b');

    if ($headword) {
      $headword = $headword->text;
      ($headword, $rest) = split /\t/, $headword, 2;
      $rest //= '';
      $headword = trim($headword);
      say $headword;

    } else { # continuation of previous headword

    }
  }
}

sub trim {
  my ($txt) = @_;
  $txt =~ s/\s{2,}/ /g;
  $txt =~ s/^ | $//g;
  # $txt =~ s/\x{9}//g;
  return $txt;
}