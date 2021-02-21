#!/usr/bin/env perl
use v5.14;
use File::Slurper 'read_text';
use FindBin qw($Bin);
use JSON::MaybeXS;
use Mojo::Pg;
use Text::CSV 'csv';

my $json = JSON->new;
my $config = $json->decode(read_text("$Bin/config.json"));
my $db = Mojo::Pg->new($config->{db})->db;

my $rows = csv(in => "$Bin/languoid.csv", headers => 'auto', encoding => 'utf-8', empty_is_undef => 1);

my $tx = $db->begin;
my $count = 0;

foreach my $row (@$rows) {
  next unless $row->{level} eq 'language';
  my $location = (defined $row->{latitude} && defined $row->{longitude})
    ? "($row->{latitude}, $row->{longitude})"
    : undef;
  $db->query('INSERT INTO language (glottocode, iso6393, name, location) VALUES (?, ?, ?, ?)',
    $row->{id}, $row->{iso639P3code}, $row->{name}, $location);
  $count++;
  say $count if $count % 100 == 0;
}

$tx->commit;
