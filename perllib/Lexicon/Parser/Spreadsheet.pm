package Lexicon::Parser::Spreadsheet;
use v5.14;
use Moo;
use namespace::clean;
use Spreadsheet::ParseXLSX;

extends 'Lexicon::Parser::CSV';

has 'sheet' => (
  is => 'ro',
  default => 0,
);

sub parse {
  my ($self, $path) = @_;
  $path ||= $self->path;
  die "could not read file: $path" unless -r $path;
  my $workbook = Spreadsheet::ParseXLSX->parse($path);
  die "could not read workbook" unless $workbook;
  my $worksheet = $workbook->worksheet($self->sheet);
  die "could not read worksheet" unless $worksheet;
  return $worksheet;
}

sub row_range {
  my ($self, $worksheet) = @_;
  my ($row_min, $row_max) = $worksheet->row_range();
  return ($row_min + $self->skip, $row_max);
}

sub get_cell {
  my ($self, $worksheet, $row, $col) = @_;
  my $cell = $worksheet->get_cell($row, $col);
  return undef unless $cell;
  return $cell->unformatted =~ s/^\s+|\s+$//gr;
}

1;
