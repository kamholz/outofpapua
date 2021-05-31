package Lexicon::Parser::Flex;
use v5.14;
use Moo;
use namespace::clean;

extends 'Lexicon::Parser::XML';
with 'Lexicon::Util';

sub read_entries {
  my ($self) = @_;
  my $dom = $self->parse;
  my $entries = [];

  my $lang_english = $self->lang_english;

  foreach my $dom_entry ($dom->find('LexEntry')->each) {
    my $headword = $dom_entry->children('LexEntry_HeadWord')->first;
    next unless $headword;
    $headword = normalize_headword(get_text_sil($headword));

    my $entry = {
      headword => $headword,
      record => [['lx', $headword]],
    };

    my $current_sense = 0;
    foreach my $sense ($dom_entry->find('LexSense')->each) {
      $self->add_sense($entry);
      $current_sense++;
      push @{$entry->{record}}, ['sn', "$current_sense"] if $current_sense > 1;

      my $pos = $sense->at('MoMorphSynAnalysisLink_MLPartOfSpeech');
      if ($pos) {
        ($pos) = get_text_sil($pos);
        push @{$entry->{record}}, ['ps', $pos];
      }

      my $gloss = $sense->at('LexSense_Definition');
      if ($gloss) {
        ($gloss) = get_text_sil($gloss);
        $self->add_gloss($entry, 'gloss', $gloss, $lang_english, $pos);
        push @{$entry->{record}}, ['g_Eng', $gloss];
      }

      foreach my $example ($sense->find('LexExampleSentence')->each) {
        my $xv = $example->at('LexExampleSentence_Example');
        if ($xv) {
          my ($txt) = get_text_sil($xv);
          my $example_obj = $self->add_example($entry, $txt, $pos);
          push @{$entry->{record}}, [marker_with_code('xv', $self->lang_target), $txt];

          foreach my $x ($example->find('CmTranslation_Translation')->each) {
            my ($txt, $code) = get_text_sil($x);
            push @$example_obj, [$txt, $code];
            push @{$entry->{record}}, [marker_with_code('x', $code), $txt];
          }
        }
      }

      $self->push_entry($entries, $entry);
    }
  }

  return $entries;
}

1;
