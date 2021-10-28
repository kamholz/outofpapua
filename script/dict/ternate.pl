#!/usr/bin/env perl
use v5.14;
use utf8;
use Data::Dumper;
use File::Slurper 'read_text';
use Mojo::DOM;
use Mojo::Util 'xml_escape';
binmode STDOUT, ':encoding(utf-8)';

process_file($_) for ('TernatewdlA-D.html', 'TernatewdlE-H.html', 'TernatewdlI-M.html', 'TernatewdlN-R.html', 'TernatewdlS-Y.html');

sub process_file {
  my ($filename) = @_;
  my $html = read_text("../dict/Berts Ternate dictionary/html/$filename");
  $html =~ s/\x{ad}//g; # soft hyphen
  my $dom = Mojo::DOM->new($html);

  $dom->find('sub')->map('remove');
  foreach my $span ($dom->find('span')->each) {
    my $style = $span->attr('style');
    next unless $style;
    $span->remove if $style =~ /font-size:14\.5pt/;
  }

  my ($sn, $headword);

  foreach my $p ($dom->find('p[class=MsoNormal]')->each) {
    next if $p->all_text =~ /^\s*$/;

    my ($left, @right);
    @right = $p->children->each;
    if (@right > 1) {
      $left = shift @right;
    }

    my $subentry = 0;

    if ($left) {
      my $tab = $left->at('span[style="mso-tab-count:2"]');
      if ($tab) {
        unshift @right, $left;
        $left = undef;
      } else {
        $tab = $left->at('span[style="mso-tab-count:1"]');
        if ($tab and not $tab->preceding_nodes->size) {
          $subentry = 1;
          $tab->remove;
          $tab = $left->at('span[style="mso-tab-count:1"]');
        }
        if ($tab) {
          my $following = $tab->following_nodes;
          unshift @right, Mojo::DOM->new('<b>' . $following->join('') . '</b>');
          $following->map('remove');
          $tab->remove;
        }
      }
    }

    if ($left) {
      $headword = trim($left->all_text);
      if ($subentry) {
        say "\n\\se $headword";
      } else {
        say "\n\\lx $headword";
      }
      $sn = 1;
    } else {
      $sn++;
    }
    say "\\sn $sn";

    foreach my $el (@right) {
      $el->find('span[style="mso-tab-count:1"], span[style="mso-tab-count:2"], p')->map('remove');
      $el->find('span[style="mso-spacerun:yes"]')->map(sub { $_->replace(' ') });
      if ($el->matches('b')) {
        tag_lx($el, $headword);
      } else {
        tag_lx($_, $headword) for $el->find('b')->each;
      }
    }
    say "\\g_Eng ", join(' ', map { trim($_->all_text) } @right);
  }
}

sub trim {
  my ($txt) = @_;
  $txt =~ s/\s+/ /g;
  $txt =~ s/^ | $//g;
  # $txt =~ s/\x{9}//g;
  return $txt;
}

sub tag_lx {
  my ($el, $headword) = @_;
  my $content = $el->content;
  if (length $content and $content !~ /^[A-Z]$/) {
    $content =~ s/\x{a0}/ /g; # non-breaking space
    $content =~ s/--/$headword/g;
    $content =~ s/( $|$)/]$1/;
    $el->content('[' . $content);
  }
}