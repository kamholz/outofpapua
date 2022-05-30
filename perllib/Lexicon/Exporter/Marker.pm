package Lexicon::Exporter::Marker;
use v5.14;
use Moo;
use namespace::clean;
use JSON::MaybeXS;

extends 'Lexicon::Exporter';

sub export_entries {
  my ($self, $entries, $gloss_language, $fh) = @_;
  my (@records, %seen);
  foreach my $entry (@$entries) {
    my $record = $entry->{record};
    next if $seen{$record};
    $seen{$record} = 1;
    push @records, $record;
  }

  my $json = JSON->new;
  foreach my $record (map { $json->decode($_) } sort { $a cmp $b } @records) {
    foreach my $rec (@$record) {
      say $fh "\\$rec->[0] $rec->[1]";
    }
    print $fh "\n";
  }
}

1;