package Lexicon::Parser::CSV;
use v5.14;
use Moo;
use namespace::clean;
use List::Util qw/any uniqstr/;
use Text::CSV;
use Unicode::Normalize 'NFC';

extends 'Lexicon::Parser';
with 'Lexicon::Util';

has 'sep_char' => (
  is => 'ro',
  default => "\t",
);

has 'quote_char' => (
  is => 'ro',
  default => undef,
);

has 'escape_char' => (
  is => 'ro',
  default => undef,
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
  default => 0,
);

has 'multiple_example_rows' => (
  is => 'ro',
  default => 0,
);

has 'match' => (
  is => 'ro',
);

sub parse {
  my ($self, $path) = @_;
  $path ||= $self->path;

  my $csv = Text::CSV->new({
    sep_char        => $self->sep_char,
    quote_char      => $self->quote_char,
    escape_char     => $self->escape_char,
    skip_empty_rows => 1,
    auto_diag       => 1,
  });

  open my $fh, '<:crlf:encoding(' . $self->encoding->[0] . ')', $path or die $!;
  my $rows = $csv->getline_all($fh);
  close $fh;
  return $rows;
}

sub row_range {
  my ($self, $rows) = @_;
  return ($self->skip, $#{$rows});
}

sub get_cell {
  my ($self, $rows, $row, $col) = @_;
  return ($rows->[$row][$col] // '') =~ s/^\s+|\s+$//gr;
}

sub read_entries {
  my ($self) = @_;
  my $rows = $self->parse;

  my $entries = [];
  my $entry = {};
  my $mode = $self->mode;
  my $columns = $self->columns;
  my $split_headword = $self->split_headword;
  my $multiple_example_rows = $self->multiple_example_rows;
  my $match = $self->match;

  if ($mode ne 'entry_per_row' and $mode ne 'sense_per_row') {
    die "unknown mode: $mode";
  }

  my ($row_min, $row_max) = $self->row_range($rows);
  for my $row ($row_min .. $row_max) {
    if ($match) {
      next unless $match->(sub { $self->get_cell($rows, $row, $_[0]) });
    }

    foreach my $col (@$columns) {
      my ($num, $type, $arg) = @$col;
      my $value = ref $num eq 'ARRAY'
        ? [map { $self->get_cell($rows, $row, $_) } @$num]
        : $self->get_cell($rows, $row, $num);

      if ($type eq 'headword') {
        my $marker = 'lx';
        my $note = $arg;

        if ($entry->{subentry}) {
          die "invalid empty headword for subentry in row $row" if $value eq '';
          $self->push_entry($entries, $entry);
          $entry = $self->reset_entry($entry, 'headword');
          $marker = 'se';
        } elsif ($mode eq 'sense_per_row') {
          if ($value eq '') { # new sense
              $self->add_sense($entry);
              push @{$entry->{record}}, ['sn', '' . scalar(@{$entry->{sense}||[]})];
              next;
          } else { # new entry
            $self->push_entry($entries, $entry) if $row > $row_min;
            $entry = $self->reset_entry($entry, 'record');
          }
        } else {
          if (length $value or !$multiple_example_rows) {
            $self->push_entry($entries, $entry);
            $entry = $self->reset_entry($entry, 'record');
          }
          next unless length $value;
        }

        my @headwords = $split_headword ? split($split_headword, $value) : ($value);

        push @{$entry->{headword}}, @headwords;
        push @{$entry->{record}}, [$marker, $_] for @headwords;
        push @{$entry->{record}}, ['nt', $note] if length $note;

        push @{$entry->{record}}, ['sn', '1'] if $mode eq 'sense_per_row';
        next;
      }

      if (ref $value) {
        next unless any { length } @$value;
      } else {
        next unless length $value;
      }

      if ($type eq 'subentry') {
        $entry->{subentry} = $value eq 'TRUE' || $value eq '1' ? 1 : 0;
      } elsif ($type eq 'page_num') {
        $entry->{page_num} = "$value";
      } elsif ($type eq 'id') {
        $entry->{id} //= $value;
      } elsif ($type eq 'ph') {
        $entry->{headword_ph} = normalize_ph($value);
        push @{$entry->{record}}, ['ph', $value];
      } elsif ($type eq 'pos') {
        $self->add_pos($entry, $value);
        push @{$entry->{record}}, ['ps', $value];
      } elsif ($type eq 'gloss') {
        my $lang = $arg;
        $self->add_gloss($entry, 'gloss', $value, $lang);
        push @{$entry->{record}}, [marker_with_code('g', $lang), $value];
      } elsif ($type eq 'sc') {
        $self->add_gloss($entry, 'gloss', $value, $self->lang_latin);
        push @{$entry->{record}}, ['sc', $value];
      } elsif ($type eq 'examples') {
        my @examples = $arg->($value);
        if (@examples) {
          push @{$entry->{sense}}, {} unless $entry->{sense};
          foreach my $ex (@examples) {
            push @{$entry->{sense}[-1]{example}}, $ex;
            my ($xv, @trans) = @$ex;
            push @{$entry->{record}}, ['xv', $xv];
            foreach my $tr (@trans) {
              push @{$entry->{record}}, [marker_with_code('x', $tr->[1]), $tr->[0]];
            }
          }
        }
      } elsif ($type eq 'example') {
        push @{$entry->{sense}}, {} unless $entry->{sense};
        my ($xv, @trans) = @$value;
        my $example = [$xv];
        push @{$entry->{record}}, ['xv', $xv];
        for (my $i = 0; $i < @$num-1; $i++) {
          my $tr = $trans[$i];
          if (length $tr) {
            my $lang = $arg->[$i];
            push @$example, [$tr, $lang];
            push @{$entry->{record}}, [marker_with_code('x', $lang), $tr];
          }
        }
        push @{$entry->{sense}[-1]{example}}, $example;
      } elsif ($type =~ /^[a-z0-9]{2}(?:_[a-z]{2})?$/) {
        my @values = $arg && $arg eq 'split' ? split(/ *; */, $value) : split(/\n/, $value);
        if ($arg and $arg ne 'split') {
          @values = map { "$arg $_" } @values;
        }
        push(@{$entry->{record}}, [$type, $_]) for @values;
      }
    }
  }

  $self->push_entry($entries, $entry);

  return $entries;
}

1;
