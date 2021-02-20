package Lexicon::Parse::Marker;
use v5.14;
use Moo;
use namespace::clean;
use List::Util 'uniqstr';

extends 'Lexicon::Parse';
with 'Lexicon::Util';

# marker(s) for new record
has record => (
  is => 'ro',
  default => sub { to_array_map('lx') },
);

# marker(s) for headword
has headword => (
  is => 'ro',
  default => sub { to_array_map(['lx','se']) },
);

# marker(s) for gloss
has gloss => (
  is => 'ro',
  default => sub { to_array_map('ge') },
);

# valid *_action values: 'merge', 'merge_[max]', 'prefer', 'prefer_[max]', 'disprefer', or 'drop'
has 'gloss_action' => (
  is => 'ro',
  default => 'merge',
);

# marker(s) for reverse lookup form
has reverse => (
  is => 'ro',
  default => sub { to_array_map('re') },
);

has 'reverse_action' => (
  is => 'ro',
  default => 'merge',
);

# marker(s) for definition
has definition => (
  is => 'ro',
  default => sub { to_array_map('de') },
);

has 'definition_action' => (
  is => 'ro',
  default => 'disprefer',
);

# marker(s) for new sense
has sense => (
  is => 'ro',
  default => sub { to_array_map('sn') },
);

around BUILDARGS => sub {
  my ($orig, $class, @args) = @_;
  my $attr = $class->$orig(@args);

  if (defined $attr->{headword}) {
    $attr->{record} //= $attr->{headword};
  }

  foreach my $att (grep { defined $attr->{$_} } qw/record headword gloss reverse definition sense/) {
    $attr->{$att} = to_array_map($attr->{$att});
  }

  return $attr;
};

sub read {
  my ($self, $path) = @_;
  my $headword = $self->headword;
  my $record = $self->record;
  my $gloss = $self->gloss;
  my $reverse = $self->reverse;
  my $definition = $self->definition;
  my $sense = $self->sense;

  my $rows = [];
  my $row = {};

  foreach my $line ($self->parse($path)) {
    my ($marker, $txt, $headword_flag) = @$line;

    if ($headword->{$marker} or $headword_flag) {
      $self->push_row($rows, $row, $record->{$marker} ? 'record' : 'headword');
      $row->{headword} = normalize_headword($txt);
    } elsif ($gloss->{$marker}) {
      $self->add_gloss($row, 'gloss', $txt);
    } elsif ($reverse->{$marker}) {
      $self->add_gloss($row, 'reverse', $txt);
    } elsif ($definition->{$marker}) {
      $self->add_gloss($row, 'definition', $txt);
    } elsif ($sense->{$marker} and defined $row->{headword}) {
      my $hw = $row->{headword};
      $self->push_row($rows, $row, 'sense'); # 1 means keep stored row if no gloss has been found yet
      $row->{headword} = $hw;
    }

    push @{$row->{record}}, [$marker, $txt];
  }
  $self->push_row($rows, $row, 'record');

  return $rows;
}

# mutates $row
sub push_row {
  my ($self, $rows, $row, $context) = @_;

  if (%{$row||{}}) {
    $self->apply_action($row, 'reverse');
    $self->apply_action($row, 'definition');

    if ($row->{gloss}) {
      push(@$rows, { %$row, gloss => $_ }) for uniqstr(@{$row->{gloss}});
    }

    if ($context eq 'record') {
      %$row = ();
    } elsif ($context eq 'headword' or $row->{gloss}) {
      %$row = (record => $row->{record});
    }
  }
}

sub apply_action {
  my ($self, $row, $item) = @_;
  if ($row->{$item}) {
    my $action = $self->${\"${item}_action"};

    my $value = delete $row->{$item};
    @$value = grep { /\w/ } @$value; # ensure at least one word char present
    return unless @$value;

    if ($action eq 'merge') {
      push @{$row->{gloss}}, @$value;
    } elsif ($action =~ /^merge_(\d+)$/) {
      push @{$row->{gloss}}, grep { length() <= $1 } @$value;
    } elsif ($action eq 'prefer') {
      $row->{gloss} = $value;
    } elsif ($action =~ /^prefer_(\d+)$/) {
      $row->{gloss} = $value unless all { length() <= $1 } @$value;
    } elsif ($action eq 'disprefer' and !$row->{gloss}) {
      $row->{gloss} = $value;
    }
  }
}

sub parse {
  my ($self, $path) = @_;
  my $encoding = $self->encoding;

  my $mode = '<:crlf';
  my $decode_by_line = 1;
  if (@$encoding == 1 and $encoding->[0] eq 'UTF-16') {
    $mode .= ':encoding(UTF-16)';
    $decode_by_line = 0;
  }

  open my $in, $mode, $path or die $!;

  # skip over the MDF header.
  while (defined(my $line = <$in>)) {
    last if $line =~ /^\s*$/;
  }

  my (@lines, $last_marker, $last_txt);

  while (defined(my $line = <$in>)) {
    $line = apply_encodings($line, $encoding) if $decode_by_line;
    chomp $line;

    $line =~ s/\x{FFFD}+$//; # remove trailing replacement chars
    $line =~ s/[\x{E000}-\x{F8FF}\x{F0000}-\x{FFFFD}\x{100000}-\x{10FFFD}]//g; # remove PUA
    $line =~ s/^(\\sn)(\d+)/$1 $2/;

    next if $line =~ /^\s*$/ || $line =~ /\x{FFFD}/;

    if (my ($marker, $txt) = $line =~ /^\\([a-zA-Z0-9_]+)(?: +(.+?))?\s*$/) {
      # the last marker (if any) is complete, so save it
      push(@lines, [$last_marker, $last_txt]) if defined $last_marker && defined $last_txt;
      ($last_marker, $last_txt) = ($marker, $txt);
    } elsif ($line !~ /^(?:\\[a-zA-Z0-9_]+)\s*$/) { # continuation of previous line's marker text
      $last_txt .= ' ' if length $last_txt;
      $last_txt .= $line =~ s/^\s+|\s+$//gr;
    }
  }
  push(@lines, [$last_marker, $last_txt]) if defined $last_marker;

  close $in;

  return @lines;
}

1;
