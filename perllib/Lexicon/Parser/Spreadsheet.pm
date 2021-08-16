package Lexicon::Parser::Spreadsheet;
use v5.14;
use Moo;
use namespace::clean;
use List::Util 'uniqstr';
use Spreadsheet::ParseXLSX;
use Unicode::Normalize qw/NFC NFD/;

extends 'Lexicon::Parser';
with 'Lexicon::Util';

has 'sheet' => (
  is => 'ro',
);

has 'columns' => (
  is => 'ro',
);

has 'mode' => (
  is => 'ro',
  default => 'entry_per_row',
);

has 'skip' => (
  is => 'ro',
  default => 1,
);

has 'headword_action' => (
  is => 'ro',
  default => '',
);

has 'split_headword' => (
  is => 'ro',
  default => sub { split_regex(';') },
);

around BUILDARGS => sub {
  my ($orig, $class, @args) = @_;
  my $attr = $class->$orig(@args);

  foreach my $att (grep { length $attr->{$_} } qw/split_headword/) {
    $attr->{$att} = split_regex($attr->{$att});
  }

  return $attr;
};

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
  my $mode = $self->mode;
  my $columns = $self->columns;
  my $headword_action = $self->headword_action;
  my $split_headword = $self->split_headword;

  my ($row_min, $row_max) = $worksheet->row_range();
  $row_min += $self->skip;
  for my $row ($row_min .. $row_max) {
    foreach my $col (@$columns) {
      my ($num, $type, @args) = @$col;
      my $cell = $worksheet->get_cell($row, $num);
      next unless $cell;
      my $value = $cell->unformatted =~ s/^\s+|\s+$//gr;

      if ($type eq 'headword') {
        my @headwords = split($split_headword, $value);

        if ($headword_action eq 'deaccent') {
          foreach my $headword (map { NFC($_) } @headwords) {
            my $deaccented = deaccent($headword);
            push @{$entry->{headword}}, $deaccented;
            push @{$entry->{record}}, ['lx', $deaccented];
            push @{$entry->{record}}, ['ph', $headword] if $headword ne $deaccented;
          }
        } else {
          push @{$entry->{headword}}, @headwords;
          push @{$entry->{record}}, ['lx', $_] for @headwords;
        }
      } elsif ($type eq 'page_num') {
        $entry->{page_num} = "$value";
      } elsif ($type eq 'gloss') {
        my $lang = $args[0];
        $self->add_gloss($entry, 'gloss', $value, $lang);
        push @{$entry->{record}}, [marker_with_code('g', $lang), $value];
      } elsif ($type eq 'pos') {
        if ($value ne '') {
          $self->add_pos($entry, $value);
          push @{$entry->{record}}, ['ps', $value];
        }
      } elsif ($type eq 'ph') {
        push @{$entry->{record}}, ['ph', $value];
      }
    }

    if ($mode eq 'entry_per_row') {
      foreach my $headword (uniqstr @{$entry->{headword}}) {
        $self->push_entry($entries, { %$entry, headword => $headword });
      }
      $entry = {};
    }
  }

  return $entries;
}

sub deaccent {
  return NFD($_[0]) =~ s/\p{M}//gr;
}

1;
