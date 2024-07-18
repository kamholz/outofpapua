package Lexicon::Exporter::Marker;
use v5.14;
use Moo;
use namespace::clean;
use JSON::MaybeXS;

extends 'Lexicon::Exporter';

has 'preserve_ids' => (
  is => 'ro',
  default => 0,
);

sub export_entries {
  my ($self, $entries, $gloss_language, $fh) = @_;
  my (@records, %seen);
  my $preseve_ids = $self->preserve_ids;

  foreach my $entry (@$entries) {
    my $record = $entry->{record};
    if ($seen{$record}) {
      die "found subentry, which is not supported in export_toolbox: $entry->{headword}";
    }
    $seen{$record} = 1;
    push @records, {
      record_json => $record,
      entry_id => $entry->{id},
    };
  }

  my $json = JSON->new;
  foreach my $obj (sort { $a->{record_json} cmp $b->{record_json} } @records) {
    my $record = $json->decode($obj->{record_json});
    if ($preseve_ids) {
      push @$record, ['outofpapua_id', $obj->{entry_id}];
    }
    foreach my $rec (@$record) {
      say $fh "\\$rec->[0] $rec->[1]";
    }
    print $fh "\n";
  }
}

1;