package Lexicon::Parser::Dictionaria;
use v5.14;
use Moo;
use namespace::clean;
use Text::CSV;

extends 'Lexicon::Parser';
with 'Lexicon::Util';

has 'lang_default' => (
  is => 'ro',
  default => 'eng',
);

has 'lang_other' => (
  is => 'ro',
  default => undef,
);

sub parse {
  my ($self, $path) = @_;
  $path ||= $self->path;

  my $csv = Text::CSV->new({
    sep_char        => ',',
    quote_char      => '"',
    escape_char     => '"',
    skip_empty_rows => 1,
    callbacks       => { after_parse => sub { s/\\t/\t/g for @{$_[1]} } },
  });

  my $tables;

  foreach my $table (qw/entries examples senses/) {
    open my $fh, '<:crlf:encoding(utf-8)', "$path/cldf/$table.csv" or die $!;
    $csv->column_names($csv->getline($fh));
    $tables->{$table} = $csv->getline_hr_all($fh);
    close $fh;
  }
  return $tables;
}

sub read_entries {
  my ($self) = @_;
  my $tables = $self->parse;

  my (%cldf_entries, %cldf_senses);

  foreach my $cldf_entry (@{$tables->{entries}}) {
    $cldf_entries{$cldf_entry->{ID}} = $cldf_entry;
  }

  foreach my $cldf_sense (@{$tables->{senses}}) {
    $cldf_senses{$cldf_sense->{ID}} = $cldf_sense;
  }

  foreach my $cldf_example (@{$tables->{examples}}) {
    foreach my $id (split / ; /, $cldf_example->{Sense_IDs}) {
      push @{$cldf_senses{$id}{examples}}, $cldf_example;
    }
  }

  foreach my $sense (values %cldf_senses) {
    push @{$cldf_entries{$sense->{Entry_ID}}{senses}}, $sense;
  }

  my $entries = [];
  my $lang_default = $self->lang_default;
  my $lang_other = $self->lang_other;

  foreach my $cldf_entry (sort { $a->{Headword} cmp $b->{Headword} } values %cldf_entries) {
    my $entry = { record => [] };
    my $record = $entry->{record};

    $entry->{headword} = $cldf_entry->{Headword};
    store($record, 'lx', $cldf_entry->{Headword});
    $entry->{headword_ph} = $cldf_entry->{Pronunciation};
    store($record, 'ph', $cldf_entry->{Pronunciation});
    store_split($record, 'va', $cldf_entry->{Variant_Form});
    store($record, 'ps', $cldf_entry->{Part_Of_Speech});

    my $num = 1;
    foreach my $cldf_sense (@{$cldf_entry->{senses}}) {
      $self->add_pos($entry, $cldf_entry->{Part_Of_Speech});
      store($record, 'sn', "$num");
      $num++;
      $self->add_gloss($entry, 'gloss', $cldf_sense->{Description}, $lang_default);
      store($record, marker_with_code('g', $lang_default), $cldf_sense->{Description});
      if ($lang_other) {
        foreach my $key (keys %$lang_other) {
          my $value = $cldf_sense->{$key};
          next unless length $value;
          my $lang = $lang_other->{$key};
          $self->add_gloss($entry, 'gloss', $value, $lang);
          store($record, marker_with_code('g', $lang), $value);
        }
      }

      foreach my $cldf_example (@{$cldf_sense->{examples}}) {
        my $example = $self->add_example($entry, $cldf_example->{Primary_Text});
        store($record, 'xv', $cldf_example->{Primary_Text});
        push @$example, [$cldf_example->{Translated_Text}, $lang_default];
        store($record, marker_with_code('x', $lang_default), $cldf_example->{Translated_Text});
        if ($lang_other) {
          foreach my $key (keys %$lang_other) {
            my $value = $cldf_example->{$key};
            next unless length $value;
            my $lang = $lang_other->{$key};
            push @$example, [$value, $lang];
            store($record, marker_with_code('x', $lang), $value);
          }
        }
      }

      store($record, 'sd', semicolon_to_comma($cldf_sense->{Semantic_Domain}));
      store($record, 'sc', semicolon_to_comma($cldf_sense->{Scientific_Name}));
      store($record, 'sy', get_headwords(\%cldf_entries, $cldf_sense->{Synonym}));
      store($record, 'an', get_headwords(\%cldf_entries, $cldf_sense->{Antonym}));
    }

    my $et = [];
    push @$et, $cldf_entry->{Source_Language} if length $cldf_entry->{Source_Language};
    push @$et, $cldf_entry->{Etymology} if length $cldf_entry->{Etymology};
    store($record, 'et', join(' ', @$et));

    store($record, 'cf', get_headwords(\%cldf_entries, $cldf_entry->{Contains}));
    store($record, 'mn', get_headwords(\%cldf_entries, $cldf_entry->{Main_Entry}));

    push @$record, ['cldf_id', $cldf_entry->{ID}];
    $self->push_entry($entries, $entry);
  }

  return $entries;
}

sub store {
  my ($record, $marker, $value) = @_;
  if (length $value) {
    push @$record, [$marker, $value];
  }
}

sub store_split {
  my ($record, $marker, $value) = @_;
  if (length $value) {
    push @$record, [$marker, $_] for split / ; /, $value;
  }
}

sub get_headwords {
  my ($cldf_entries, $value) = @_;
  return $value unless length $value;
  return join(', ', map { $cldf_entries->{$_}{Headword} } split / ; /, $value);
}

sub semicolon_to_comma {
  my ($value) = @_;
  return $value unless length $value;
  return join(', ', split / ; /, $value);
}

1;