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

    my $seen_pos;
    my $current_sense = 0;
    foreach my $sense ($dom_entry->find('LexSense')->each) {
      $current_sense++;
      push @{$entry->{record}}, ['sn', "$current_sense"] if $current_sense > 1;

      my $pos = $sense->at('MoMorphSynAnalysisLink_MLPartOfSpeech');
      if ($pos) {
        $pos = get_text_sil($pos);
        if (defined $seen_pos and $seen_pos ne $pos) {
          $self->push_entry($entries, $entry);
          $entry = $self->reset_entry($entry, 'pos');
        } else {
          $self->add_sense($entry);
        }
        $entry->{pos} = $seen_pos = $pos;
        push @{$entry->{record}}, ['ps', $pos];
      } else {
        $self->add_sense($entry);
      }

      my $gloss = $sense->at('LexSense_Definition');
      if ($gloss) {
        $gloss = get_text_sil($gloss);
        $self->add_gloss($entry, 'gloss', $gloss, $lang_english);
        push @{$entry->{record}}, ['ge', $gloss];
      }

      foreach my $example ($sense->find('LexExampleSentence')->each) {
        collect_record_sil($entry->{record}, $example->at('LexExampleSentence_Example'), 'xv');
        collect_record_sil($entry->{record}, $example->at('CmTranslation_Translation'), 'xe');
      }

      $self->push_entry($entries, $entry);
    }
  }

  return $entries;
}

1;
