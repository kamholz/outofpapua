package Lexicon::Parse::Marker;
use v5.14;
use Moo;
use namespace::clean;

extends 'Lexicon::Parse';
with 'Lexicon::Util';

has record => (
  is => 'ro',
  default => sub { to_array_map('lx') },
);

has headword => (
  is => 'ro',
  default => sub { to_array_map(['lx','se']) },
);

has gloss => (
  is => 'ro',
  default => sub { to_array_map('ge') },
);

has reverse => (
  is => 'ro',
  default => sub { to_array_map('re') },
);

has definition => (
  is => 'ro',
  default => sub { to_array_map('de') },
);

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

  my ($rows, $row);

  foreach my $line ($self->parse($path)) {
    my ($marker, $txt, $headword_flag) = @$line;

    if ($headword->{$marker} or $headword_flag) {
      $self->push_row($rows, $row, $record->{$marker} ? 'record' : 'headword');
      $row->{headword} = normalize_headword($txt);
    } elsif ($gloss->{$marker}) {
      $self->add_gloss('gloss', $txt);
    } elsif ($reverse->{$marker}) {
      $self->add_gloss('reverse', $txt);
    } elsif ($definition->{$marker}) {
      $self->add_gloss('definition', $txt);
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

1;
