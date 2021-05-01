package Lexicon::Parser::Marker;
use v5.14;
use Moo;
use namespace::clean;
use List::Util 'any';

extends 'Lexicon::Parser';
with 'Lexicon::Util';

# marker(s) for new record
has 'record' => (
  is => 'ro',
  default => sub { to_array_map('lx') },
);

# marker(s) for headword
has 'headword' => (
  is => 'ro',
  default => sub { to_array_map(['lx','se']) },
);

# marker(s) for headword in citation form
has 'headword_citation' => (
  is => 'ro',
  default => sub { to_array_map([]) },
);

# marker(s) for new sense
has 'sense' => (
  is => 'ro',
  default => sub { to_array_map('sn') },
);

# marker(s) for part of speech
has 'pos' => (
  is => 'ro',
  default => sub { to_array_map('ps') },
);

# marker(s) for gloss
has 'gloss' => (
  is => 'ro',
  lazy => 1,
  default => sub {
    my $self = shift;
    return {
      ge => $self->lang_english,
      gr => $self->lang_regional,
      gn => $self->lang_national,
      g  => 'und',
    };
  },
);

# marker(s) for reverse lookup form
has 'reverse' => (
  is => 'ro',
  lazy => 1,
  default => sub {
    my $self = shift;
    return {
      re => $self->lang_english,
      rr => $self->lang_regional,
      rn => $self->lang_national,
      r  => 'und',
    };
  },
);

# marker(s) for definition
has 'definition' => (
  is => 'ro',
  lazy => 1,
  default => sub {
    my $self = shift;
    return {
      de => $self->lang_english,
      dr => $self->lang_regional,
      dn => $self->lang_national,
      d  => 'und',
    };
  },
);

# marker(s) for example
has 'example' => (
  is => 'ro',
  default => sub { to_array_map('xv') },
);

# marker(s) for example translation
has 'example_trans' => (
  is => 'ro',
  lazy => 1,
  default => sub {
    my $self = shift;
    return {
      xe => $self->lang_english,
      xr => $self->lang_regional,
      xn => $self->lang_national,
      x  => 'und',
    };
  },
);

# marker(s) for record's page_num
has 'page_num' => (
  is => 'ro',
  default => sub { to_array_map('bib_Eng') },
);

around BUILDARGS => sub {
  my ($orig, $class, @args) = @_;
  my $attr = $class->$orig(@args);

  if (defined $attr->{headword}) {
    $attr->{record} //= $attr->{headword};
  }

  foreach my $att (grep { defined $attr->{$_} } qw/headword headword_citation page_num record sense/) {
    $attr->{$att} = to_array_map($attr->{$att});
  }

  return $attr;
};

sub read_entries {
  my ($self) = @_;
  my $headword = $self->headword;
  my $headword_citation = $self->headword_citation;
  my $record = $self->record;
  my $pos = $self->pos;
  my $sense = $self->sense;
  my $gloss = $self->gloss;
  my $reverse = $self->reverse;
  my $definition = $self->definition;
  my $example = $self->example;
  my $example_trans = $self->example_trans;
  my $page_num = $self->page_num;

  my $entries = [];
  my $entry = {};
  my ($seen_pos, $seen_example);

  foreach my $line ($self->parse) {
    my ($marker_orig, $txt, $headword_flag) = @$line;

    # don't save page_num in record, just in $entry
    if ($page_num->{$marker_orig}) {
      $entry->{page_num} = $txt;
      next;
    }

    my ($marker, $lang);
    if ($marker_orig =~ /^(.+)_([A-Z][a-z]{2})$/) {
      ($marker, $lang) = ($1, lc $2);
    } else {
      $marker = $marker_orig;
    }

    if ($seen_example) {
      $seen_example = undef unless $example_trans->{$marker};
    }

    if ($headword->{$marker} or $headword_flag) {
      $self->push_entry($entries, $entry);
      $entry = $self->reset_entry($entry, $record->{$marker} ? 'record' : 'headword');
      $seen_pos = undef;
      $entry->{headword} = normalize_headword($txt);
    } elsif ($headword_citation->{$marker}) {
      $entry->{headword_citation} = normalize_headword($txt);
    } elsif ($pos->{$marker}) {
      if (defined $seen_pos and $seen_pos ne $txt) {
        $self->push_entry($entries, $entry);
        $entry = $self->reset_entry($entry, 'pos');
      }
      $entry->{pos} = $seen_pos = $txt;
    } elsif (exists $gloss->{$marker}) {
      $self->add_gloss($entry, 'gloss', $txt, $lang // $gloss->{$marker});
    } elsif (exists $reverse->{$marker}) {
      $self->add_gloss($entry, 'reverse', $txt, $lang // $reverse->{$marker});
    } elsif (exists $definition->{$marker}) {
      $self->add_gloss($entry, 'definition', $txt, $lang // $definition->{$marker});
    } elsif ($sense->{$marker}) {
      $self->add_sense($entry);
    } elsif ($example->{$marker}) {
      $seen_example = $self->add_example($entry, $txt);
    } elsif ($example_trans->{$marker}) {
      push @$seen_example, [$txt, $lang // $example_trans->{$marker}] if $seen_example;
    }

    push @{$entry->{record}}, [$marker_orig, $txt];
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
