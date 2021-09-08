package Lexicon::Parser::CSV;
use v5.14;
use Moo;
use namespace::clean;
use List::Util 'uniqstr';
use Text::CSV;
use Unicode::Normalize qw/NFC NFD/;

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

has 'headword_action' => (
  is => 'ro',
  default => '',
);

sub parse {
  my ($self, $path) = @_;
  $path ||= $self->path;

  my $csv = Text::CSV->new({
    sep_char        => $self->sep_char,
    quote_char      => $self->quote_char,
    escape_char     => $self->escape_char,
    skip_empty_rows => 1,
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
  my $headword_action = $self->headword_action;
  my $split_headword = $self->split_headword;

  my $row_func;
  if ($mode eq 'entry_per_row') {
    $row_func = sub {
      $self->push_entry($entries, $entry);
      $entry = {};
    };
  } elsif ($mode eq 'sense_per_row') {
    $row_func = sub {
      $entry = {
        headword => $entry->{headword},
        sense => $entry->{sense},
        record => $entry->{record},
      };
    };
  } else {
    die "unknown mode: $mode";
  }

  my ($row_min, $row_max) = $self->row_range($rows);
  for my $row ($row_min .. $row_max) {
    foreach my $col (@$columns) {
      my ($num, $type, $args) = @$col;
      my $value = $self->get_cell($rows, $row, $num);

      if ($type eq 'headword') {
        my $marker = 'lx';

        if ($mode eq 'sense_per_row') {
          if ($entry->{subentry}) {
            die "invalid empty headword for subentry in row $row" if $value eq '';
            $self->push_entry($entries, $entry);
            $entry = { record => $entry->{record} };
            $marker = 'se';
          } elsif ($value eq '') { # new sense
              $self->add_sense($entry);
              push @{$entry->{record}}, ['sn', scalar(@{$entry->{sense}||[]})];
              next;
          } else { # new entry
            $self->push_entry($entries, $entry) if $row > $row_min;
            $entry = {};
          }
        } else {
          next unless length $value;
        }

        my @headwords = $split_headword ? split($split_headword, $value) : ($value);

        if ($headword_action eq 'deaccent') {
          foreach my $headword (map { NFC($_) } @headwords) {
            my $deaccented = deaccent($headword);
            push @{$entry->{headword}}, $deaccented;
            push @{$entry->{record}}, [$marker, $deaccented];
            push @{$entry->{record}}, ['ph', $headword] if $headword ne $deaccented;
          }
        } else {
          push @{$entry->{headword}}, @headwords;
          push @{$entry->{record}}, [$marker, $_] for @headwords;
        }

        push @{$entry->{record}}, ['sn', 1] if $mode eq 'sense_per_row';
        next;
      }

      next unless length $value;

      if ($type eq 'subentry') {
        $entry->{subentry} = $value eq 'TRUE' ? 1 : 0;
      } elsif ($type eq 'page_num') {
        $entry->{page_num} = "$value";
      } elsif ($type eq 'gloss') {
        my $lang = $args;
        $self->add_gloss($entry, 'gloss', $value, $lang);
        push @{$entry->{record}}, [marker_with_code('g', $lang), $value];
      } elsif ($type eq 'pos') {
        if ($value ne '') {
          $self->add_pos($entry, $value);
          push @{$entry->{record}}, ['ps', $value];
        }
      } elsif ($type eq 'examples') {
        push @{$entry->{sense}}, {} unless $entry->{sense};
        my $obj = $args->($value);
        foreach my $example (@{$obj->{example}||[]}) {
          push @{$entry->{sense}[-1]{example}}, $example;
        }
        push @{$entry->{record}}, @{$obj->{record}||[]};
      } elsif ($type eq 'note') {
        my @values = split /\n/, $value;
        push(@{$entry->{record}}, ['nt', $args ? "$args $_" : $_]) for @values;
      } elsif ($type =~ /^[a-z]{2}$/) {
        my @values = split /\n/, $value;
        push(@{$entry->{record}}, [$type, $_]) for @values;
      }
    }

    $row_func->();
  }

  $self->push_entry($entries, $entry) if $mode eq 'sense_per_row';

  return $entries;
}

sub deaccent {
  return NFD($_[0]) =~ s/\p{M}//gr;
}

1;
