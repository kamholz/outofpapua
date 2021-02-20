package Lexicon::Parse::Flex;
use v5.14;
use Moo;
use namespace::clean;

extends 'Lexicon::Parse::XML';
with 'Lexicon::Util';

sub read {
  my ($self, $path) = @_;
  my $dom = $self->parse($path);
  my @rows;

  foreach my $entry ($dom->find('LexEntry')->each) {
    my $headword = $entry->children('LexEntry_HeadWord')->first;
    next unless $headword;
    $headword = normalize_headword(get_text_sil($headword));

    foreach my $sense ($entry->find('LexSense')->each) {
      my $row = { headword => $headword, record => [['lx', $headword]] };

      my $gloss = $sense->at('LexSense_Definition');
      if ($gloss) {
        $gloss = get_text_sil($gloss);
        push @{$row->{record}}, ['ge', $gloss];
        push @{$row->{gloss}}, $self->extract_glosses($gloss);
      }

      collect_record_sil($row->{record}, $sense->at('MoMorphSynAnalysisLink_MLPartOfSpeech'), 'ps');

      foreach my $example ($sense->find('LexExampleSentence')->each) {
        collect_record_sil($row->{record}, $example->at('LexExampleSentence_Example'), 'xv');
        collect_record_sil($row->{record}, $example->at('CmTranslation_Translation'), 'xe');
      }

      if ($row->{gloss}) {
        push(@rows, { %$row, gloss => $_ }) for @{$row->{gloss}};
      }
    }
  }

  return \@rows;
}

1;
