package Lexicon::Parse;
use v5.14;
use Moo;
use namespace::clean;
use List::Util qw/uniqstr/;

with 'Lexicon::Util';

has 'encoding' => (
  is => 'ro',
  default => 'utf-8',
);

has 'gloss_action' => (
  is => 'ro',
  default => 'merge',
);

has 'reverse_action' => (
  is => 'ro',
  default => 'merge',
);

has 'definition_action' => (
  is => 'ro',
  default => 'disprefer',
);

foreach my $attr (qw/gloss reverse definition/) {
  has "${attr}_preprocess" => (
    is => 'ro',
  );
}

has 'split' => (
  is => 'ro',
  default => sub { split_regex(';') },
);

has 'split_heuristic' => (
  is => 'ro',
);

has 'strip' => (
  is => 'ro',
);

around BUILDARGS => sub {
  my ($orig, $class, @args) = @_;
  my $attr = $class->$orig(@args);

  foreach my $att (grep { length $attr->{$_} } qw/split split_heuristic/) {
    $attr->{$att} = split_regex($attr->{$att});
  }

  foreach my $att (grep { defined $attr->{$_} } qw/record headword gloss reverse definition sense/) {
    $attr->{$att} = to_array_map($attr->{$att});
  }

  foreach my $att (grep { defined $attr->{$_} } qw/encoding strip/) {
    $attr->{$att} = to_array($attr->{$att});
  }

  return $attr;
};

sub read {
  die "must be implemented by subclass";
}

sub parse {
  die "must be implemented by subclass";
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
    my $action = $self->can("${item}_action")->();

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

sub add_gloss {
  my ($self, $row, $item, $txt) = @_;

  my $pre = $self->can("${item}_preprocess")->();
  if ($pre) {
    $txt = $pre->($txt);
    return if $txt =~ /^\s*$/;
  }

  push(@{$row->{$item}}, $self->extract_glosses($txt));
}

sub extract_glosses {
  my ($self, $txt) = @_;

  my @items = $self->split
    ? split($self->split, $txt)
    : $txt;

  if ($self->split_heuristic) {
    @items = map { _split_heuristic($_, $self->split_heuristic) } @items;
  }

  return map { _normalize_gloss($_, $self->strip) } @items;
}

sub _split_heuristic {
  my ($txt, $re) = @_;
  my @items = split($re, $txt);
  return (all { /^[\w-]+$/ } @items)
    ? @items
    : $txt;
}

sub _normalize_gloss {
  my ($txt, $strip) = @_;
  $txt =~ s/\s+/ /g; # collapse whitespace
  $txt =~ s/(?<=\S)_(?=\S)/ /g; # remove underscore between words
  $txt =~ s/(?:^| )\K([^.]\S+[^.])(?= |$)/$1 =~ s{(?<=\w)\.(?=\w)}{ }gr/ge; # remove dot between words
  $txt =~ s/^[=?] //;
  $txt =~ s/^(?:be|\(be\)|to be|\(to be\)|a|\(a\)|an|\(an\)|the|\(the\)) //;

  if ($strip) {
    $txt =~ s/^\Q$_\E // for @$strip;
  }

  return $txt;
}

1;
