package Lexicon::Parser::Fieldworks;
use v5.14;
use Moo;
use namespace::clean;

extends 'Lexicon::Parser::XML';
with 'Lexicon::Util';

has lang_target => (
  is => 'ro',
);

has lang_national => (
  is => 'ro',
);

sub read_entries {
  my ($self) = @_;
  my $dom = $self->parse;
  my $items;
  my $lang_target = $self->lang_target;
  my $lang_national = $self->lang_national;

  foreach my $item ($dom->find('rt')->each) {
    my $attr = $items->{$item->attr('guid')} = {
      element => $item,
      class => $item->attr('class'),
    };

    my $name = $item->at('Name');
    $attr->{name} = get_text_fw($name, 'en') if $name;
  }

  my $get_obj = sub {
    my ($item, $tag) = @_;
    return map { $items->{$_->attr('guid')} } $item->find("$tag objsur")->each;
  };

  my @entries;

  foreach my $entry (map { $_->{element} } grep { $_->{class} eq 'LexEntry' } values %$items) {
    my ($form) = map { $_->{element} } $get_obj->($entry, 'LexemeForm');
    next unless $form;
    $form = get_text_fw($form, $lang_target);
    next unless length $form;

    my $row = { headword => $form, record => [['lx', $form]] };

    foreach my $variant (map { $_->{element} } $get_obj->($entry, 'AlternateForms')) {
      $variant = get_text_fw($variant, $lang_target);
      push @{$row->{record}}, ['va', $variant] if length $variant;
    }

    foreach my $analysis (map { $_->{element} } $get_obj->($entry, 'MorphoSyntaxAnalyses')) {
      foreach my $pos ($get_obj->($analysis, 'PartOfSpeech')) {
        push @{$row->{record}}, ['ps', $pos->{name}] if length $pos->{name};
      }
    }

    my $current_sense = 0;
    foreach my $sense (map { $_->{element} } $get_obj->($entry, 'Senses')) {
      my $gloss = $sense->at('Gloss');
      next unless $gloss;
      $current_sense++;
      push @{$row->{record}}, ['sn', $current_sense] if $current_sense > 1;

      my $ge = get_text_fw($gloss, 'en');
      if (length $ge) {
        push @{$row->{record}}, ['ge', $ge];
        push @entries, { %$row, gloss => $_ } for $self->extract_glosses($ge);
      }

      my $gn = get_text_fw($gloss, $lang_national);
      push @{$row->{record}}, ['gn', $gn] if length $gn;

      collect_record_sil($row->{record}, $sense->at('Definition'), 'de');
      collect_record_sil($row->{record}, $sense->at('SemanticsNote'), 'nt');
      collect_record_sil($row->{record}, $sense->at('GeneralNote'), 'nt');
      collect_record_sil($row->{record}, $sense->at('EncyclopedicInfo'), 'ee');
    }

    foreach my $ref (map { $_->{element} } $get_obj->($entry, 'EntryRefs')) {
      my @components;

      foreach my $component (map { $_->{element} } $get_obj->($ref, 'ComponentLexemes')) {
        my ($form) = map { $_->{element} } $get_obj->($component, 'LexemeForm');
        next unless $form;
        $form = get_text_fw($form, $lang_target);
        next unless length $form;

        my @senses;
        foreach my $sense (map { $_->{element} } $get_obj->($component, 'Senses')) {
          my $gloss = $sense->at('Gloss');
          next unless $gloss;
          my $ge = get_text_fw($gloss, 'en');
          push(@senses, $ge) if length $ge;
        }

          push(@components, $form . ' ‘' . join(', ', @senses) . '’') if @senses;
        }

        push(@{$row->{record}}, ['nt', "Constituents: " . join('; ', @components)]) if @components;
    }
  }

  return \@entries;
}

sub get_text_fw {
  my ($elt, $lang) = @_;
  return undef unless $lang;
  my $auni = $elt->at(qq(AUni[ws="$lang"]));
  return undef unless $auni;
  return $auni->text;
}

1;
