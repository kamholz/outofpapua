package Lexicon::Parser;
use v5.14;
use Moo;
use namespace::clean;

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

sub add_gloss {
  my ($self, $sense, $item, $txt, $lang) = @_;

  my $pre = $self->${\"${item}_preprocess"};
  if ($pre) {
    $txt = $pre->($txt);
    return if $txt =~ /^\s*$/;
  }

  push(@{$sense->{$item}}, map { [$_, $lang] } $self->extract_glosses($txt));
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
