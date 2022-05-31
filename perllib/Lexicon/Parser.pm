package Lexicon::Parser;
use v5.14;
use Moo;
use namespace::clean;
use Lexicon::Util 'ensure_nfc';
use List::Util qw(all any uniqstr);
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

foreach my $attr (qw/headword pos gloss reverse definition/) {
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

# string of chars to split headword on
has 'split_headword' => (
  is => 'ro',
  default => sub { split_regex(';') },
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

# valid values: 'merge', 'merge_[max]', 'prefer', 'prefer_[max]', 'disprefer', 'ignore'
has 'reverse_action' => (
  is => 'ro',
  default => 'merge',
);

# valid values: 'merge', 'merge_[max]', 'prefer', 'prefer_[max]', 'disprefer', 'ignore'
has 'definition_action' => (
  is => 'ro',
  default => 'ignore',
);

# valid values: 'ignore', 'prefer_root'
has 'headword_citation_action' => (
  is => 'ro',
  default => 'ignore',
);

around BUILDARGS => sub {
  my ($orig, $class, @args) = @_;
  my $attr = $class->$orig(@args);

  foreach my $att (grep { length $attr->{$_} } qw/split split_heuristic split_headword/) {
    $attr->{$att} = split_regex($attr->{$att});
  }

  foreach my $att (grep { defined $attr->{$_} } qw/encoding strip/) {
    $attr->{$att} = to_array($attr->{$att});
  }

  return $attr;
};

sub parse {
  die 'must be implemented by subclass';
}

sub read_entries {
  die 'must be implemented by subclass';
}

sub get_toolbox_records {
  my ($self, $action) = @_;
  my (@records, %seen);
  foreach my $entry (@{$self->read_entries($action && $action eq 'messy')}) {
    my $record = $entry->{record};
    next if $seen{$record};
    $seen{$record} = 1;
    push @records, $record;
  }
  return \@records;
}

sub print_toolbox_records {
  my ($self, $records, $fh) = @_;
  foreach my $record (@$records) {
    foreach my $rec (@$record) {
      say $fh "\\$rec->[0] ", ensure_nfc($rec->[1]);
    }
    print $fh "\n";
  }
}

sub push_entry {
  my ($self, $entries, $entry) = @_;

  if (any { $_ ne 'headword' and $_ ne 'record' } keys %{$entry||{}}) {
    if (!ref $entry->{headword} and !length $entry->{headword}) {
      say "warning: empty headword";
      return;
    }

    foreach my $sense (@{$entry->{sense}||[]}) {
      $self->apply_action($sense, 'reverse');
      $self->apply_action($sense, 'definition');

      foreach my $item (qw/gloss definition/) {
        next unless @{$sense->{$item}||[]};
        @{$sense->{$item}} = uniq_by { join('|||', @$_) } @{$sense->{$item}};
      }
    }

    if ($self->split_headword) {
      # allow format-specific parser to have already split headwords
      my @headwords = uniqstr(ref $entry->{headword} eq 'ARRAY' 
        ? @{$entry->{headword}}
        : split($self->split_headword, $entry->{headword})
      );
      $self->push_single_entry($entries, { %$entry, headword => $_ }) for @headwords;
    } elsif (ref $entry->{headword}) {
      $self->push_single_entry($entries, { %$entry, headword => $_ }) for @{$entry->{headword}};
    } else {
      $self->push_single_entry($entries, $entry);
    }
  }
}

sub push_single_entry {
  my ($self, $entries, $entry) = @_;

  $self->apply_citation_action($entry);
  $self->apply_headword_preprocess($entry);

  if (!length $entry->{headword}) {
    say "warning: empty headword";
    return;
  }

  # $self->apply_pos_preprocess($entry);

  push(@$entries, $entry);
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

sub apply_citation_action {
  my ($self, $entry) = @_;
  if (length $entry->{headword_citation}) {
    my $citation_action = $self->headword_citation_action;
    if ($citation_action ne 'ignore' and ($entry->{headword} // '') ne $entry->{headword_citation}) {
      if ($citation_action eq 'prefer_root') {
        ($entry->{headword}, $entry->{root}) = ($entry->{headword_citation}, $entry->{headword});
      }
    }
    delete $entry->{headword_citation};
  }
}

sub apply_headword_preprocess {
  my ($self, $entry) = @_;
  my $pre = $self->${\'headword_preprocess'};
  if ($pre) {
    $entry->{headword} = $pre->($entry->{headword});
  }
}

sub apply_pos_preprocess {
  my ($self, $entry) = @_;
  my $pre = $self->${\'pos_preprocess'};
  if ($pre) {
    foreach my $sense (@{$entry->{sense}||[]}) {
      if (length $sense->{pos}) {
        $sense->{pos} = $pre->($sense->{pos});
        $sense->{pos} = undef unless length $sense->{pos};
      }
    }
  }
}

sub apply_action {
  my ($self, $sense, $item) = @_;
  if ($sense->{$item}) {
    my $action = $self->${\"${item}_action"};
    return if $action eq 'ignore';

    my $value = [
      grep { $_->[0] =~ /\w/ } # ensure at least one word char present
      @{$sense->{$item}||[]}
    ];
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

sub add_pos {
  my ($self, $entry, $pos) = @_;

  if (@{$entry->{sense}||[]} and not
    (defined $pos and defined $entry->{sense}[-1]{pos} and $pos ne $entry->{sense}[-1]{pos})) {
    $entry->{sense}[-1]{pos} //= $pos;
  } else {
    push @{$entry->{sense}}, { pos => $pos };
  }
}

sub add_gloss {
  my ($self, $entry, $item, $txt, $lang, $pos) = @_;

  my $pre = $self->${\"${item}_preprocess"};
  if ($pre) {
    $txt = $pre->($txt);
    return if $txt =~ /^\s*$/;
  }

  $self->add_pos($entry, $pos);

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
