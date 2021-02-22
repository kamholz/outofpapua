package Lexicon::Parser::Marker;
use v5.14;
use Moo;
use namespace::clean;
use List::Util 'any';

extends 'Lexicon::Parser';
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

# marker(s) for new sense
has sense => (
  is => 'ro',
  default => sub { to_array_map('sn') },
);

# marker(s) for part of speech
has pos => (
  is => 'ro',
  default => sub { to_array_map('ps') },
);

# marker(s) for gloss
has gloss => (
  is => 'ro',
  lazy => 1,
  default => sub {
    my $self = shift;
    return { ge => $self->lang_english, gr => $self->lang_regional, gn => $self->lang_national };
  },
);

# marker(s) for reverse lookup form
has reverse => (
  is => 'ro',
  lazy => 1,
  default => sub {
    my $self = shift;
    return { re => $self->lang_english, rr => $self->lang_regional, rn => $self->lang_national };
  },
);

# marker(s) for definition
has definition => (
  is => 'ro',
  lazy => 1,
  default => sub {
    my $self = shift;
    return { de => $self->lang_english, dr => $self->lang_regional, dn => $self->lang_national };
  },
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

sub read_entries {
  my ($self) = @_;
  my $headword = $self->headword;
  my $record = $self->record;
  my $pos = $self->pos;
  my $gloss = $self->gloss;
  my $reverse = $self->reverse;
  my $definition = $self->definition;
  my $sense = $self->sense;

  my $entries = [];
  my $entry = {};
  my $seen_pos;

  foreach my $line ($self->parse) {
    my ($marker, $txt, $headword_flag) = @$line;

    if ($headword->{$marker} or $headword_flag) {
      $self->push_entry($entries, $entry);
      $entry = $self->reset_entry($entry, $record->{$marker} ? 'record' : 'headword');
      $seen_pos = undef;
      $entry->{headword} = normalize_headword($txt);
    } elsif ($pos->{$marker}) {
      if (defined $seen_pos and $seen_pos ne $txt) {
        $self->push_entry($entries, $entry);
        $entry = $self->reset_entry($entry, 'pos');
      }
      $entry->{pos} = $seen_pos = $txt;
    } elsif (exists $gloss->{$marker}) {
      $self->add_gloss($entry, 'gloss', $txt, $gloss->{$marker});
    } elsif (exists $reverse->{$marker}) {
      $self->add_gloss($entry, 'reverse', $txt, $reverse->{$marker});
    } elsif (exists $definition->{$marker}) {
      $self->add_gloss($entry, 'definition', $txt, $definition->{$marker});
    } elsif ($sense->{$marker}) {
      $self->add_sense($entry);
    }

    push @{$entry->{record}}, [$marker, $txt];
  }
  $self->push_entry($entries, $entry);

  return $entries;
}

sub parse {
  my ($self) = @_;
  my $encoding = $self->encoding;

  my $mode = '<:crlf';
  my $decode_by_line = 1;
  if (@$encoding == 1 and $encoding->[0] eq 'UTF-16') {
    $mode .= ':encoding(UTF-16)';
    $decode_by_line = 0;
  }

  open my $in, $mode, $self->path or die $!;

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
