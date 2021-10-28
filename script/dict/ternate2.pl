#!/usr/bin/env perl
use v5.14;
use utf8;
use Data::Dumper;
use File::Slurper 'read_text';
use Mojo::DOM;
use Mojo::Util 'xml_escape';
binmode STDOUT, ':encoding(utf-8)';

process_file($_) for ('Ternatebotlst1.html', 'Ternatebotlst2.html');

sub process_file {
  my ($filename) = @_;
  my $html = read_text("../dict/Berts Ternate dictionary/html/$filename");
  $html =~ s/\x{ad}//g; # soft hyphen
  my $dom = Mojo::DOM->new($html);

  foreach my $span ($dom->find('p[class=MsoNormal] > i > span')->each) {
    next if $span->all_text =~ /^\s*$/;
    $span->find('p')->map('remove');

    my $headword = trim($span->at('b')->all_text);
    my $gloss = trim($span->child_nodes->first->content);

    say "\\lx $headword";
    say "\\g_Eng $gloss";
    print "\n";
  }
}

sub trim {
  my ($txt) = @_;
  $txt =~ s/\s+/ /g;
  $txt =~ s/^ | $//g;
  # $txt =~ s/\x{9}//g;
  return $txt;
}