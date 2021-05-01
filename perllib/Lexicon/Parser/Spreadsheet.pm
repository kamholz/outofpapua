package Lexicon::Parser::Spreadsheet;
use v5.14;
use Moo;
use namespace::clean;
use Spreadsheet::ParseXLSX;

extends 'Lexicon::Parser';
with 'Lexicon::Util';

has 'sheet' => (
  is => 'ro',
);

has 'columns' => (
  is => 'ro',
);

has 'entry_per_row' => (
  is => 'ro',
  default => 1,
);

has 'skip' => (
  is => 'ro',
  default => 1,
);

sub read_entries {
  my ($self) = @_;
  my $parser = Spreadsheet::ParseXLSX->new;
  die "could not read file: " . $self->path unless -r $self->path;
  my $workbook = $parser->parse($self->path);
  die "could not read workbook" unless $workbook;
  my $worksheet = $workbook->worksheet($self->sheet // 0);
  die "could not read worksheet" unless $worksheet;

  my $entries = [];
  my $entry = {};
  my $entry_per_row = $self->entry_per_row;
  my $columns = $self->columns;
  my $col_count = @$columns;

  my ($row_min, $row_max) = $worksheet->row_range();
  $row_min += $self->skip;
  for my $row ($row_min .. $row_max) {
    if ($entry_per_row) {
      $self->push_entry($entries, $entry);
      $entry = {};
    }
    for (my $i = 0; $i < $col_count; $i++) {
      my $col = $columns->[$i];
      next unless $col;
      my $cell = $worksheet->get_cell($row, $i);
      next unless $cell;
      my $value = $cell->unformatted;

      if ($col->[0] eq 'headword') {
        $entry->{headword} = $value;
        push @{$entry->{record}}, [['lx', $value]];
      } elsif ($col->[0] eq 'page_num') {
        $entry->{page_num} = $value;
      } elsif ($col->[0] eq 'gloss') {
        $self->add_gloss($entry, 'gloss', $value, $col->[1]);
        push @{$entry->{record}}, [[marker_with_code('g', $col->[1]), $value]];
      }
    }
  }

  return $entries;
}

1;
