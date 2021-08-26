use v5.14;

my %perl_attr = (
  'van Staden (1996)' => {
    gloss_preprocess => sub { $_[0] =~ s/_/ /gr },
    headword_preprocess => sub { $_[0] =~ s/_/ /gr },
  },
  'Kamholz (nd.a)' => {
    gloss_preprocess => sub { $_[0] =~ s/^-$//r },
  },
  'Kamholz (nd.b)' => {
    gloss_preprocess => sub { $_[0] =~ s/^-$//r },
  },
  'Kamholz (nd.c)' => {
    gloss_preprocess => sub { $_[0] =~ s/^-$//r },
  },
  'Kamholz (nd.d)' => {
    gloss_preprocess => sub { $_[0] =~ s/^-$//r },
  },
);

sub add_perl_attr {
  my ($dict, $source_reference) = @_;
  $dict->{$source_reference} = { %{$dict->{$source_reference}||{}}, %{$perl_attr{$source_reference}||{}} };
}

1;