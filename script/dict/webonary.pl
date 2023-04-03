#!/usr/bin/env perl
use v5.14;
use File::Slurper 'write_text';
use Mojo::URL;
use Mojo::UserAgent;

my $ua = Mojo::UserAgent->new;
$ua->max_redirects(3);

my ($dir, $url) = @ARGV;
my $base_url = Mojo::URL->new($url)->query('')->to_string;

say "\nFetching initial dictionary page...";
my $res = $ua->get($url)->result;
if ($res->is_success) {
  say 'succeeded.';
} else {
  die "fetch failed, giving up\n";
}

mkdir $dir;
chdir $dir;

foreach my $letter ($res->dom->find('.lpTitleLetter')->each) {
  my $letter_str = lc strip($letter->content);
  my $query = strip($letter->attr('href'));
  my $url = $query =~ /^https?:/ ? $query : $base_url . $query;

  say "\nFetching letter: $letter_str";
  my $res = $ua->get($url)->result;
  if (!$res->is_success) {
    die "fetch failed, giving up\n";
  }

  my @pages = $res->dom->find('#wp_page_numbers a')->each;
  if (@pages) {
    foreach my $page (@pages) {
      my $num = strip($page->content);
      next if $num !~ /^\d+$/;
      my $filename = $letter_str . '_' . sprintf("%03d", $num) . '.html';
      say "$filename ...";

      my $query = strip($page->attr('href'));
      my $res = $ua->get($base_url . $query)->result;
      if (!$res->is_success) {
        say $res->code;
        die "fetch failed, giving up\n";
      }
      write_text $filename, $res->body;
    }
  } else {
      my $filename = $letter_str . '_' . sprintf("%03d", 1) . '.html';
      say "$filename ...";
      write_text $filename, $res->body;
  }
}

sub strip {
  return $_[0] =~ s/^\s+|\s+$//gr;
}