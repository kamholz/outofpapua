#!/usr/bin/env perl
use v5.14;
use Dotenv -load => 'app/.env';
use File::Slurper 'read_text';
use FindBin qw($Bin);
use Mojo::Pg;
use Text::CSV 'csv';

my $db = Mojo::Pg->new->db;

my $rows = csv(in => "$Bin/iso-639-3.tab", headers => 'auto', encoding => 'utf-8', sep_char => "\t", empty_is_undef => 1);

my $tx = $db->begin;
my $count = 0;

foreach my $row (@$rows) {
  next unless $row->{Part1};
  $db->query('INSERT INTO iso6391 (iso6391, iso6393) VALUES (?, ?)',
    $row->{Part1}, $row->{Id});
  $count++;
  say $count if $count % 100 == 0;
}

$tx->commit;
