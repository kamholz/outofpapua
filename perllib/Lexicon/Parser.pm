package Lexicon::Parser;
use v5.14;
use Moo;
use namespace::clean;
use List::Util qw(all any);
use List::UtilsBy 'uniq_by';

with 'Lexicon::Util';

# file path
has 'path' => (
  is => 'ro',
  required => 1,
);

# character encoding
has 'encoding' => (
  is => 'ro',
  default => sub { ['utf-8'] },
);

foreach my $attr (qw/gloss reverse definition/) {
  has "${attr}_preprocess" => (
    is => 'ro',
  );
}

# string of chars to split gloss/reverse/definition on (default ';', undef if none)
has 'split' => (
  is => 'ro',
  default => sub { split_regex(';') },
);

has 'split_heuristic' => (
  is => 'ro',
);

# word(s) to strip from beginning of gloss/reverse/definition
has 'strip' => (
  is => 'ro',
);

has 'lang_target' => (
  is => 'ro',
);

has 'lang_english' => (
  is => 'ro',
  default => 'eng',
);

has 'lang_national' => (
  is => 'ro',
  default => 'und',
);

has 'lang_regional' => (
  is => 'ro',
  default => 'und',
);

# valid *_action values: 'merge', 'merge_[max]', 'prefer', 'prefer_[max]', 'disprefer', 'ignore', 'drop'
has 'reverse_action' => (
  is => 'ro',
  default => 'merge',
);

has 'definition_action' => (
  is => 'ro',
  default => 'ignore',
);

around BUILDARGS => sub {
  my ($orig, $class, @args) = @_;
  my $attr = $class->$orig(@args);

  foreach my $att (grep { length $attr->{$_} } qw/split split_heuristic/) {
    $attr->{$att} = split_regex($attr->{$att});
  }

  foreach my $att (grep { defined $attr->{$_} } qw/encoding strip/) {
    $attr->{$att} = to_array($attr->{$att});
  }

  return $attr;
};

sub read_entries {
  die "must be implemented by subclass";
}

sub parse {
  die "must be implemented by subclass";
}

sub push_entry {
  my ($self, $entries, $entry) = @_;

  if (any { $_ ne 'headword' and $_ ne 'record' } keys %{$entry||{}}) {
    foreach my $sense (@{$entry->{sense}||[]}) {
      $self->apply_action($sense, 'reverse');
      $self->apply_action($sense, 'definition');

      foreach my $item (qw/gloss definition/) {
        next unless @{$sense->{$item}||[]};
        @{$sense->{$item}} = uniq_by { join('|||', @$_) } @{$sense->{$item}};
      }
    }

    push(@$entries, $entry);
  }
}

sub reset_entry {
  my ($self, $entry, $context) = @_;

  if ($context eq 'headword') {
    return {
      record => $entry->{record},
    };
  } else {
    return {};
  }
}

sub apply_action {
  my ($self, $sense, $item) = @_;
  if ($sense->{$item}) {
    my $action = $self->${\"${item}_action"};
    return if $action eq 'ignore';

    my $value = delete $sense->{$item};
    @$value = grep { $_->[0] =~ /\w/ } @$value; # ensure at least one word char present
    return unless @$value;

    if ($action eq 'merge') {
      push @{$sense->{gloss}}, @$value;
    } elsif ($action =~ /^merge_(\d+)$/) {
      push @{$sense->{gloss}}, grep { length($_->[0]) <= $1 } @$value;
    } elsif ($action eq 'prefer') {
      $sense->{gloss} = $value;
    } elsif ($action =~ /^prefer_(\d+)$/) {
      $sense->{gloss} = $value unless all { length($_->[0]) <= $1 } @$value;
    } elsif ($action eq 'disprefer' and !$sense->{gloss}) {
      $sense->{gloss} = $value;
    }
  }
}

sub add_sense {
  my ($self, $entry) = @_;
  if ($entry->{sense} and %{$entry->{sense}[-1]}) {
    push @{$entry->{sense}}, {};
  }
}

sub add_gloss {
  my ($self, $entry, $item, $txt, $lang, $pos) = @_;

  my $pre = $self->${\"${item}_preprocess"};
  if ($pre) {
    $txt = $pre->($txt);
    return if $txt =~ /^\s*$/;
  }

  if (@{$entry->{sense}||[]}) {
    $entry->{sense}[-1]{pos} //= $pos;
  } else {
    push @{$entry->{sense}}, { pos => $pos };
  }
  push(@{$entry->{sense}[-1]{$item}}, map { [$_, $lang] } $self->extract_glosses($txt));
}

sub add_example {
  my ($self, $entry, $txt, $pos) = @_;
  my $example = [$txt];
  if (@{$entry->{sense}||[]}) {
    $entry->{sense}[-1]{pos} //= $pos;
  } else {
    push @{$entry->{sense}}, { pos => $pos };
  }
  push @{$entry->{sense}[-1]{example}}, $example;
  return $example;
}

sub extract_glosses {
  my ($self, $txt) = @_;

  my @items = $self->split
    ? split($self->split, $txt)
    : $txt;

  if ($self->split_heuristic) {
    @items = map { _split_heuristic($_, $self->split_heuristic) } @items;
  }

  return grep { length } map { _normalize_gloss($_, $self->strip) } @items;
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
