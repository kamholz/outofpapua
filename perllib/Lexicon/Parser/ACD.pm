package Lexicon::Parser::ACD;
use v5.14;
use Moo;
use namespace::clean;
use File::Slurper 'read_text';
use JSON::MaybeXS;

extends 'Lexicon::Parser';
with 'Lexicon::Util';

my $json = JSON->new;
my $url_base = 'https://www.trussel2.com/ACD/';

my %proto_abbrev = (
  'Proto-Malayo-Polynesian' => 'PMP',
  'Proto-Central-Eastern Malayo-Polynesian' => 'PCEMP',
  'Proto-Eastern Malayo-Polynesian' => 'PEMP',
  'Proto-SHWNG', 'PSHWNG',
  'Proto-Oceanic', 'POc',
);

sub read_entries {
  my ($self) = @_;
  my $entries = [];

  foreach my $record ($self->parse) {
    my $entry = {
      headword => $record->{headword},
      record => [
        ['lx', $record->{headword}],
        ['ge', $record->{gloss}],
        ['url', $url_base . $record->{link}],
      ],
    };

    my @senses = $self->split
      ? split($self->split, $record->{gloss})
      : $record->{gloss};

    foreach my $sense (@senses) {
      $self->add_sense($entry);
      $self->add_gloss($entry, 'gloss', $sense, $self->lang_english);
    }

    $self->push_entry($entries, $entry);
  }

  return $entries;
}

sub parse {
  my ($self) = @_;
  my $lang_target = $self->lang_target;
  my $proto = $proto_abbrev{$lang_target};
  die "unknown proto-language: $lang_target" unless $proto;

  my @entries;
  foreach my $file (glob($self->path . '/*.json')) {
    my $parsed = $json->decode(read_text($file, 'utf-8'));
    push @entries, grep { $_->{proto} eq $proto } map { @$_ } @$parsed;
  }
  return @entries;
}

1;