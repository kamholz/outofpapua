package Lexicon::Exporter::CSV;
use v5.14;
use Moo;
use namespace::clean;
use Text::CSV;

extends 'Lexicon::Exporter';

sub export_entries {
  my ($self, $entries, $gloss_language, $fh) = @_;

  my @cols = ('ID', 'Page Number', 'Headword', 'POS');
  my @gloss_language_cols = sort { $gloss_language->{$a}{name} cmp $gloss_language->{$a}{name} } keys %$gloss_language;
  my $col_num = 4;
  foreach my $col (@gloss_language_cols) {
    push @cols, $gloss_language->{$col}{name};
    $gloss_language->{$col}{col} = $col_num++;
  }

  my $csv = Text::CSV->new({ eol => $/ });
  $csv->print($fh, \@cols);

  foreach my $entry (@$entries) {
    my $sn = 1;
    foreach my $sense (@{$entry->{senses}}) {
      my $row = $sn == 1
        ? [$entry->{id}, $entry->{page_num}, $entry->{headword}, $sense->{pos}]
        : [('') x 3, $sense->{pos}];
      foreach my $gloss (@{$sense->{glosses}}) {
        my $col = $gloss_language->{$gloss->{language_id}}{col};
        $row->[$col] = join('; ', @{$gloss->{txt}});
      }
      $csv->print($fh, $row);
      $sn++;
    }
  }
}

1;