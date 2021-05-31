package Lexicon::Parser::LexiqueDocx;
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
  my $lang_national = $self->lang_national;
  my $lang_regional = $self->lang_regional;

  foreach my $p ($dom->find('p')->each) {
    next unless $p->at('pStyle[val="EntryParagraph"]') || $p->at('pStyle[val="IndentedParagraph"]');
    merge_records_docx($p);

    my $entry;
    my $seen_pos;
    my $seen_example;

    foreach my $r ($p->find('r')->each) {
      my $type = get_type_docx($r);
      next unless length $type;
      my $txt = get_text_docx($r);
      $txt =~ s/\s*\.+$// if $type =~ /^(?:DefinitionE|Definition[nr])$/;
      next unless length $txt;

      if ($type eq 'Lexeme' or $type eq 'Subentry') {
        $seen_pos = $seen_example = undef;
        $entry->{headword} = normalize_headword($txt);
        push @{$entry->{record}}, ['lx', $entry->{headword}];
      } elsif ($type eq 'DefinitionE') {
        $self->add_gloss($entry, 'gloss', $txt, $lang_english, $seen_pos);
        push @{$entry->{record}}, ['ge', $txt];
      } elsif ($type eq 'Partofspeech') {
        $seen_pos = $txt;
        push @{$entry->{record}}, ['ps', $txt];
      } elsif ($type eq 'Definitionn') {
        $self->add_gloss($entry, 'gloss', $txt, $lang_national, $seen_pos);
        push @{$entry->{record}}, ['gn', $txt];
      } elsif ($type eq 'Examplev') {
        $seen_example = $self->add_example($entry, $txt, $seen_pos);
        push @{$entry->{record}}, ['xv', $txt];
      } elsif ($type eq 'ExamplefreetransE') {
        push @$seen_example, [$txt, $lang_english] if $seen_example;
        push @{$entry->{record}}, ['xe', $txt];
      } elsif ($type eq 'Examplefreetransn') {
        push @$seen_example, [$txt, $lang_national] if $seen_example;
        push @{$entry->{record}}, ['xn', $txt];
      } elsif ($type eq 'Examplefreetransr') {
        push @$seen_example, [$txt, $lang_regional] if $seen_example;
        push @{$entry->{record}}, ['xr', $txt];
      } elsif ($type =~ /^(?:flabel|Reference|Definitionr|Encyclopedicinfo[Er]|Notesgeneral)$/) {
        $txt =~ s/\s*\.+$//;
        push @{$entry->{record}}, ['', $txt] if length $txt;
      }
    }

    $self->push_entry($entries, $entry);
  }

  return $entries;
}

sub merge_records_docx {
  my ($p) = @_;
  my @recs = $p->find('r')->each;

  for (my $i = 0; $i < @recs; $i++) {
    my $r = $recs[$i];
    my $type = get_type_docx($r);
    next unless length $type;

    my $merge_until = -1;

    for (my $j = $i+1; $j < @recs; $j++) {
      my $next_type = get_type_docx($recs[$j]);
      last unless $next_type;
      if ($next_type =~ /^(?:fstandard|fregional|fvernacular|fEnglish|Non-MDF)$/) {
        $merge_until = $j if $type eq 'flabel';
        next;
      }
      last if $next_type ne $type;
      $merge_until = $j;
    }

    if ($merge_until > $i) {
      foreach my $j ($i+1 .. $merge_until) {
        my $t = $recs[$j]->at('t');
        $r->at('t')->append_content($t->text) if $t;
        $recs[$j]->remove;
      }

      $i = $merge_until;
    }
  }
}

sub get_text_docx {
  my ($el) = @_;
  $el = $el->at('t');
  return $el ? $el->text =~ s/^\s+|\s+$//gr : undef;
}

sub get_type_docx {
  my ($r) = @_;
  my $type = $r->at('rStyle');
  return undef unless $type;
  return $type->attr('w:val');
}

1;
