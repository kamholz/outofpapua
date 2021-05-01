package Lexicon::Parser::Fieldworks;
use v5.14;
use Moo;
use namespace::clean;

extends 'Lexicon::Parser::XML';
with 'Lexicon::Util';

has '+lang_english' => (
  is => 'ro',
  default => 'en',
);

has 'lang_target' => (
  is => 'ro',
);

sub read_entries {
  my ($self) = @_;
  my $dom = $self->parse;
  my $items;
  my $lang_target = $self->lang_target;
  my $lang_english = $self->lang_english;
  my $lang_national = $self->lang_national;
  my $lang_regional = $self->lang_regional;

  foreach my $item ($dom->find('rt')->each) {
    my $attr = $items->{$item->attr('guid')} = {
      element => $item,
      class => $item->attr('class'),
    };

    my $name = $item->at('Name');
    $attr->{name} = get_text_fw($name, $lang_english) if $name;
  }

  my $get_obj = sub {
    my ($item, $tag) = @_;
    return map { $items->{$_->attr('guid')} } $item->find("$tag objsur")->each;
  };

  my $entries = [];

  foreach my $entry_elt (map { $_->{element} } grep { $_->{class} eq 'LexEntry' } values %$items) {
    my ($form_elt) = map { $_->{element} } $get_obj->($entry_elt, 'LexemeForm');
    next unless $form_elt;
    my $form = get_text_fw($form_elt, $lang_target);
    next unless length $form;

    my $entry = {
      headword => $form,
      record => [['lx', $form]],
    };

    foreach my $variant_elt (map { $_->{element} } $get_obj->($entry_elt, 'AlternateForms')) {
      my $variant = get_text_fw($variant_elt, $lang_target);
      push @{$entry->{record}}, ['va', $variant] if length $variant;
    }

    my $seen_pos;
    my $current_sense = 0;
    foreach my $sense_elt (map { $_->{element} } $get_obj->($entry_elt, 'Senses')) {
      $current_sense++;
      push @{$entry->{record}}, ['sn', "$current_sense"] if $current_sense > 1;

      my $pos;
      my $analysis_elt = ($get_obj->($sense_elt, 'MorphoSyntaxAnalysis'))[0];
      if ($analysis_elt) {
        my $pos_elt = ($get_obj->($analysis_elt->{element}, 'PartOfSpeech'))[0];
        if ($pos_elt) {
          $pos = $pos_elt->{name};
        } else {
          my $from_pos_elt = ($get_obj->($analysis_elt->{element}, 'FromPartOfSpeech'))[0];
          if ($from_pos_elt) {
            my $to_pos_elt = ($get_obj->($analysis_elt->{element}, 'ToPartOfSpeech'))[0];
            if ($to_pos_elt) {
              $pos = "$from_pos_elt->{name} > $to_pos_elt->{name}";
            }
          }
        }
      }

      if (length $pos) {
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

      my $gloss_elt = $sense_elt->at('Gloss');
      if ($gloss_elt) {
        foreach my $lang ($lang_english, $lang_national, $lang_regional) {
          my $gloss = get_text_fw($gloss_elt, $lang);
          if (length $gloss) {
            $self->add_gloss($entry, 'gloss', $gloss, $lang);
            push @{$entry->{record}}, [marker_with_code('g', code3($lang)), $gloss];
          }
        }
      }

      my $definition_elt = $sense_elt->at('Definition');
      if ($definition_elt) {
        foreach my $lang ($lang_english, $lang_national, $lang_regional) {
          my $definition = get_text_sil_lang($definition_elt, $lang);
          if (length $definition) {
            $self->add_gloss($entry, 'definition', $definition, $lang);
            push @{$entry->{record}}, [marker_with_code('d', code3($lang)), $definition];
          }
        }
      }

      collect_record_sil($entry->{record}, $sense_elt->at('SemanticsNote'), 'nt');
      collect_record_sil($entry->{record}, $sense_elt->at('GeneralNote'), 'nt');
      collect_record_sil($entry->{record}, $sense_elt->at('EncyclopedicInfo'), 'ee');
    }

    foreach my $ref_elt (map { $_->{element} } $get_obj->($entry_elt, 'EntryRefs')) {
      my @components;

      foreach my $component_elt (map { $_->{element} } $get_obj->($ref_elt, 'ComponentLexemes')) {
        my ($form_elt) = map { $_->{element} } $get_obj->($component_elt, 'LexemeForm');
        next unless $form_elt;
        my $form = get_text_fw($form_elt, $lang_target);
        next unless length $form;

        my @senses;
        foreach my $sense_elt (map { $_->{element} } $get_obj->($component_elt, 'Senses')) {
          my $gloss = $sense_elt->at('Gloss');
          next unless $gloss;
          my $ge = get_text_fw($gloss, $lang_english);
          push(@senses, $ge) if length $ge;
        }

          push(@components, $form . ' ‘' . join(', ', @senses) . '’') if @senses;
        }

        push(@{$entry->{record}}, ['nt', 'Constituents: ' . join('; ', @components)]) if @components;
    }

    $self->push_entry($entries, $entry);
  }

  return $entries;
}

sub get_text_fw {
  my ($elt, $lang) = @_;
  return undef unless $lang;
  my $auni = $elt->at(qq(AUni[ws="$lang"]));
  return undef unless $auni;
  return $auni->text;
}

1;
