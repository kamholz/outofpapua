#!/usr/bin/env perl
use v5.14;
use utf8;
use Data::Dumper;
use File::Slurper 'read_text';
use Mojo::DOM;
binmode STDOUT, ':encoding(utf-8)';
binmode STDERR, ':encoding(utf-8)';

my $dom = Mojo::DOM->new(read_text('../dict/grammar of moskona/grammar of moskona.html'));

merge_spans($dom);

foreach my $span ($dom->find('span')->each) {
  my $txt = get($span);
  next unless length $txt;
  next if $txt eq '.' || $txt =~ /^5\d\d$/ || $txt eq 'Moskona-English wordlist' || $txt eq 'Appendix D';
  if ($span->matches('[style="font-family: XYOGBW+TimesNewRoman,Bold; font-size:8px"]')) {
    say "\n\\lx $txt";  
  } elsif ($span->matches('[style="font-family: HUAWOV+TimesNewRoman,Italic; font-size:9px"]')) {
    say "\\ps $txt";
  } elsif ($span->matches('[style="font-family: REEYEE+TimesNewRoman; font-size:9px"]')) {
    $txt =~ s/^\. //;
    say "\\g_Eng $txt";
  }
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

sub merge_spans {
  my ($dom) = @_;

  foreach my $doulos ($dom->find('[style="font-family: CXOYBI+SILDoulosIPA93,Bold; font-size:7px"]')->each) {
    $doulos->replace(qq(<span style="font-family: XYOGBW+TimesNewRoman,Bold; font-size:8px">\x{301}</span>));
  }

  foreach my $smallcap ($dom->find('[style="font-family: REEYEE+TimesNewRoman; font-size:7px"]')->each) {
    $smallcap->replace($dom->new_tag('span', style => 'font-family: REEYEE+TimesNewRoman; font-size:9px', $smallcap->text));
  }

  my @spans = $dom->find('span')->each;
  for (my $i = 0; $i < @spans; $i++) {
    my $span = $spans[$i];

    while (1) {
      my $next = $span->next;
      last unless $next and $span->attr('style') eq $next->attr('style');
      $span->append_content($next->content);
      $next->remove;
      $i++;
    }
  }
}