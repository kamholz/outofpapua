#!/usr/bin/env perl
use v5.14;
use utf8;
use File::Slurper 'read_text';
use Mojo::DOM;
binmode STDOUT, ':encoding(utf-8)';

my $dom = Mojo::DOM->new(read_text('../dict/gravelle meyah/gravelle_meyah2004v2.html'));

# remove sense numbers (can still infer senses from semicolons)
$dom->find('span[style="font-family: CTXLMA+TTE16E14C8t00; font-size:6px"]')->map('remove');

# remove empty spans
foreach my $span ($dom->find('span')->each) {
  $span->remove if $span->text =~ /^\s+$/;
}

# remove header/footer
foreach my $span ($dom->find('span[style="font-family: CTXLMA+TTE16E14C8t00; font-size:10px"]')->each) {
  my $text = $span->text;
  $span->remove if $text =~ /^\d+/;
}

# remove div so spans are all siblings
foreach my $div ($dom->find('div')->each) {
  $div->replace($div->content);
}

# merge small caps
foreach my $span ($dom->find('span[style="font-family: CTXLMA+TTE16E14C8t00; font-size:8px"]')->each) {
  my $prev = $span->previous;
  $prev->append_content($span->text);
  $span->remove;
}

# merge 10px spans
foreach my $span ($dom->find('span[style="font-family: CTXLMA+TTE16E14C8t00; font-size:10px"]')->each) {
  while (1) {
    my $next = $span->next;
    last unless $next;
    my $text = trim($next->text);
    if ($next->matches('span[style="font-family: NCQSPY+TTE16EC008t00; font-size:9px"]')) {
      unless ($span->text =~ /\([^()]*$/) {
        $text = '(' . $text . ')';
      }
      $span->append_content($text);
      $next->remove;
    } elsif ($next->matches('span[style="font-family: CTXLMA+TTE16E14C8t00; font-size:10px"]')) {
      $span->append_content($text);
      $next->remove;
    } else {
      last;
    }
  }
}

# merge 9px spans into 10px
foreach my $span ($dom->find('span[style="font-family: NCQSPY+TTE16EC008t00; font-size:9px"]')->each) {
  my $next = $span->next;
  if ($next->matches('span[style="font-family: CTXLMA+TTE16E14C8t00; font-size:10px"]')) {
    my $text = $span->text;
    $next->prepend_content('(' . trim($text) . ')');
    $span->remove;
  }
}

foreach my $headword ($dom->find('span[style="font-family: HXVYRX+TTE16E3C70t00; font-size:8px"]')->each) {
  my $gloss = $headword->next;
  next unless $gloss->matches('span[style="font-family: CTXLMA+TTE16E14C8t00; font-size:10px"]');
  $headword = trim($headword->text);
  $gloss = trim($gloss->text);
  say join("\t", $headword, $gloss);
}

sub trim {
  my ($txt) = @_;
  $txt =~ s/\s{2,}/ /g;
  $txt =~ s/^ | $//g;
  # $txt =~ s/\x{9}//g;
  return $txt;
}