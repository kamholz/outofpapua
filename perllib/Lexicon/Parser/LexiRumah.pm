package Lexicon::Parser::LexiRumah;
use v5.14;
use Moo;
use namespace::clean;
use Text::CSV;

extends 'Lexicon::Parser';
with 'Lexicon::Util';

has 'lexirumah_source' => (
  is => 'ro',
  required => 1,
);

has 'lexirumah_lect' => (
  is => 'ro',
  required => 1,
);

sub parse {
  my ($self, $path, $key, $array) = @_;

  my $csv = Text::CSV->new({ auto_diag => 1 });
  open my $fh, '<:crlf:encoding(' . $self->encoding->[0] . ')', $path or die $!;
  $csv->column_names($csv->getline($fh));
  my $output = {};
  while (my $row = $csv->getline_hr($fh)) {
    if ($array) {
      push @{$output->{$row->{$key}}}, $row;
    } else {
      $output->{$row->{$key}} = $row;
    }
  }
  close $fh;
  return $output;
}

sub read_entries {
  my ($self) = @_;
  my $dir = $self->path;
  my $source = $self->lexirumah_source;
  my $lect = $self->lexirumah_lect;

  my $concepts = $self->parse("$dir/concepts.csv", 'ID', 0);
  my $forms = $self->parse("$dir/forms.csv", 'Source', 1);

  my $entries = [];

  foreach my $form (@{$forms->{$source}}) {
    next unless $form->{Lect_ID} eq $lect;
    my $concept = $concepts->{$form->{Concept_ID}};
    next unless $concept;

    my $entry = {};

    my $add_marker = sub {
      my ($form_attr, $marker, $attr) = @_;
      my $value = $form->{$form_attr};
      if (length $value) {
        push @{$entry->{record}}, [$marker, $value];
        $entry->{$attr} = $value if $attr;
      }
    };

    my $add_gloss = sub {
      my ($concept_attr, $lang) = @_;
      my $value = $concept->{$concept_attr};
      $self->add_gloss($entry, 'gloss', $value, $lang);
      push @{$entry->{record}}, [marker_with_code('g', $lang), $value];
    };

    $add_marker->('Local_Orthography', 'lx', 'headword');
    $add_marker->('Form', 'ph', 'headword_ph');
    $add_gloss->('English', 'eng');
    $add_gloss->('Indonesian', 'ind');
    $add_marker->('Comment', 'nt');

    $self->push_entry($entries, $entry);
    $entry = $self->reset_entry($entry, 'record');
  }

  return $entries;
}

1;
