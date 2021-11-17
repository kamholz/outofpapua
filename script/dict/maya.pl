#!/usr/bin/env perl
use v5.14;
use utf8;
use Data::Dumper;
use File::Slurper 'read_text';
use List::Util 'first';
use Mojo::DOM;
binmode STDOUT, ':encoding(utf-8)';
binmode STDERR, ':encoding(utf-8)';

my %styles;
$styles{'AGaramond'}{'9.840'} = 'plain';
$styles{'AGaramond'}{'6.888'} = 'plain,superscript';
$styles{'AGaramond-Bold'}{'9.840'} = 'bold';
$styles{'AGaramond-Bold'}{'6.888'} = 'bold,superscript';
$styles{'AGaramond-Bold'}{'5.904'} = 'bold,subscript';
$styles{'AGaramond-NormalItalic'}{'9.840'} = 'italic';

process_file("../dict/Maya/$_") for ('Dictionary a-d.xml', 'Dictionary e-i.xml', 'Dictionary k.xml', 'Dictionary l.xml', 'Dictionary m-n.xml', 'Dictionary o-s.xml', 'Dictionary t-y.xml');

sub process_file {
  my ($path) = @_;
  my $dom = Mojo::DOM->new->xml(1)->parse(read_text($path));

  my $state = 'none';
  my $buffer = '';
  my $last_style;

  my $print_buffer = sub {
    $buffer =~ s/\s+/ /g;
    $buffer =~ s/^ | $//g;

    if (length $buffer) {
      if ($state eq 'headword') {
        say "\n\\lx $buffer";
      } elsif ($state eq 'italic' and $buffer ne ':') {
        say "\\ps $buffer";
      } else {
        say "\\$state $buffer";
      }
    }

    $buffer = '';
  };

  foreach my $el ($dom->find('text')->each) {
    my $style = get_style($el);
    my $char = $el->text;
    my @bbox = bbox($el);
    my $have_font = exists $el->attr->{font};
    # say "char: $char, style: ", $style // '';

    if ($style) {
      if ($style =~ s/,superscript$//) {
        $char = superscript($char);
      } elsif ($style =~ s/,subscript$//) {
        $char = subscript($char);
      }

      if ($style eq 'bold' and $bbox[0] < 88) {
        $print_buffer->();
        $state = 'headword';
        # say "new headword";
      } elsif (!($last_style and $style eq $last_style)) {
        $print_buffer->();
        $state = $style;
      }

      $buffer .= $char;
    } elsif ($last_style and !$have_font) {
      $buffer .= $char;
    }

    $last_style = $style if $have_font;
  }
}

sub bbox {
  my ($el) = @_;
  return split /,/, $el->attr('bbox');
}

sub get_style {
  my ($el) = @_;
  my $attr = $el->attr;
  return undef unless $attr->{font} && $attr->{size};
  my $font = $attr->{font} =~ s/^.+?\+//r;
  return $styles{$font}{$attr->{size}};
}

sub superscript {
  return $_[0] =~ tr/0123456789/⁰¹²³⁴⁵⁶⁷⁸⁹/r;
}

sub subscript {
  return $_[0] =~ tr/0123456789/₀₁₂₃₄₅₆₇₈₉/r;
}