package Lexicon::Parser::LexiqueHTML;
use v5.14;
use Moo;
use namespace::clean;

extends 'Lexicon::Parser::HTML';
with 'Lexicon::Util';

sub read_entries {
  my ($self) = @_;
  my @files = $self->path =~ /\*/ ? glob($self->path) : ($self->path);

  my $entries = [];
  my $lang_english = $self->lang_english;
  my $lang_national = $self->lang_national;
  my $lang_regional = $self->lang_regional;

  foreach my $file (@files) {
    my $dom = $self->parse($file);

    foreach my $entry_el ($dom->find('.entry, .subentry')->each) {
      my $headword = get_text_lexique_html($entry_el, '.mainheadword, .headword');
      next unless length $headword;

      my $senses = $entry_el->at('.senses');
      next unless $senses;

      my $entry = {
        headword => $headword,
        record => [['lx', $headword]]
      };
      my $entry_pos;

      foreach my $variant ($entry_el->children('.variantformentrybackrefs')->map('find', '.headword')->flatten->each) {
        my $variant_txt = get_text_lexique_html($variant);
        push @{$entry->{record}}, ['va', $variant_txt];
      }

      my $ph = get_text_lexique_html($entry_el, '.lexemeform, .pronunciation .form');
      push(@{$entry->{record}}, ['ph', $ph]) if length $ph;

      my $pos = get_text_lexique_html($senses, '.sharedgrammaticalinfo .partofspeech');
      if (length $pos) {
        push(@{$entry->{record}}, ['ps', $pos]);
        $entry_pos = $pos;
      }

      my $current_sense = 1;
      my ($sense_added, $sense_pos);
      my $add_sense_record = sub {
        if (!$sense_added) {
          $sense_added = 1;
          push @{$entry->{record}}, ['sn', $current_sense++];
          push(@{$entry->{record}}, ['ps', $sense_pos]) if length $sense_pos;
        }
      };

      foreach my $sense ($senses->find('.sense')->each) {
          my $glosses = $sense->at('[class^="definition"], .gloss');
          next unless $glosses;

          $sense_added = 0;
          # sense-specific pos, overrides any shared entry pos
          $sense_pos = get_text_lexique_html($sense, '.partofspeech');
          my $pos = $sense_pos // $entry_pos;

          my $ge = get_gloss_lexique_html($glosses, 'en');
          if (length $ge) {
            $add_sense_record->();
            $self->add_gloss($entry, 'gloss', $ge, $lang_english, $pos);
            push @{$entry->{record}}, [marker_with_code('g', $lang_english), $ge];
          }
          if ($lang_national) {
            my $gn = get_gloss_lexique_html($glosses, $lang_national);
            if (length $gn) {
              $add_sense_record->();
              $self->add_gloss($entry, 'gloss', $gn, $lang_national, $pos);
              push @{$entry->{record}}, [marker_with_code('g', $lang_national), $gn];
            }
          }
          if ($lang_regional) {
            my $gr = get_gloss_lexique_html($glosses, $lang_regional);
            if (length $gr) {
              $add_sense_record->();
              $self->add_gloss($entry, 'gloss', $gr, $lang_regional, $pos);
              push @{$entry->{record}}, [marker_with_code('g', $lang_regional), $gr];
            }
          }

          foreach my $example_el ($sense->find('.examplescontent')->each) {
            my $xv = $example_el->at('.example');
            next unless $xv;
            $xv = trim($xv->all_text);
            my $example = $self->add_example($entry, $xv, $pos);
            push @{$entry->{record}}, ['xv', $xv];
            foreach my $tr ($example_el->find('.translation > span[lang]')->each) {
              my $lang = $tr->attr('lang');
              next unless $lang;
              $lang = code3($lang);
              my $txt = trim($tr->all_text);
              push @$example, [$txt, $lang];
              push @{$entry->{record}}, [marker_with_code('x', $lang), $txt];
            }
          }

          my $ee = $sense->at('.encyclopedicinfo');
          if ($ee) {
            push @{$entry->{record}}, ['ee', trim($ee->all_text)];
          }

          my $sc = $sense->at('.scientificname');
          if ($sc) {
            push @{$entry->{record}}, ['sc', trim($sc->all_text)];
          }
      }

      foreach my $etym ($entry_el->find('.etymologies .etymology')->each) {
        my @notes;
        my $lang = $etym->at('.languagenotes > span');
        push(@notes, trim($lang->text)) if $lang;
        my $form = $etym->at('.form > span');
        push(@notes, trim($form->text)) if $form;
        push(@{$entry->{record}}, ['et', 'from ' . join(' ', @notes)]) if @notes;
      }

      foreach my $comment ($entry_el->find('.comment > span, .semanticdomain, .semantic-domains')->each) {
        push @{$entry->{record}}, ['nt', trim($comment->all_text)];
      }

      $self->push_entry($entries, $entry);
    }
  }

  return $entries;
}

sub get_text_lexique_html {
  my ($el, $sel) = @_;
  if ($sel) {
    $el = $el->at($sel);
    return undef unless $el;
  }
  $el->find('[style]')->map('remove');
  return trim($el->all_text);
}

sub get_gloss_lexique_html {
  my ($el, $lang) = @_;
  $el = $el->at(qq(span[lang="$lang"]));
  return $el ? trim($el->text) : undef;
}

sub trim {
  my ($txt) = @_;
  $txt =~ s/^\s+|\s+$//g;
  $txt =~ s/\s+/ /g;
  return $txt;
}

1;
