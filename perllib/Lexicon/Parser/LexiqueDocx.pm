package Lexicon::Parser::LexiqueDocx;
use v5.14;
use Moo;
use namespace::clean;

extends 'Lexicon::Parser::XML';
with 'Lexicon::Util';

my %type_to_marker = (
  DefinitionE       => ['g', 'e'],
  Definitionn       => ['g', 'n'],
  Definitionr       => ['g', 'r'],
  EncyclopedicinfoE => ['e', 'e'],
  Encyclopedicinfon => ['e', 'n'],
  Encyclopedicinfor => ['e', 'r'],
  Examplev          => 'xv',
  ExamplefreetransE => ['x', 'e'],
  Examplefreetransn => ['x', 'n'],
  Examplefreetransr => ['x', 'r'],
  Lexeme            => 'lx',
  Notesgeneral      => 'nt',
  Partofspeech      => 'ps',
  Reference         => 'rf',
);

sub read_entries {
  my ($self, $messy) = @_;
  my $dom = $self->parse;
  my $entries = [];

  my $lang_english = $self->lang_english;
  my $lang_national = $self->lang_national;
  my $lang_regional = $self->lang_regional;

  foreach my $p ($dom->find('p.EntryParagraph')->each) {
    merge_records_docx($p);

    my $entry;
    my $seen_pos;
    my $seen_example;

    foreach my $r ($p->find('> span')->each) {
      my $type = get_type_docx($r);
      next unless length $type;
      my $txt = get_text_docx($r);
      $txt =~ s/\s*\.+$// if $type =~ /^Definition(?:E|[nr])$/;
      next unless length $txt;

      if ($type eq 'Lexeme' or $type eq 'Subentry') {
        $entry = $self->reset_entry($entry, $type eq 'Lexeme' ? 'record' : 'headword');
        $seen_pos = $seen_example = undef;
        $entry->{headword} = normalize_headword($txt);
        push @{$entry->{record}}, [$type eq 'Lexeme' ? 'lx' : 'se', $txt];
      } elsif (exists $type_to_marker{$type}) {
        my $marker = $type_to_marker{$type};
        if (ref $marker eq 'ARRAY') {
          my $lang;
          ($marker, $lang) = @$marker;
          my $code = $self->code_from_lang($lang);
          if ($code eq 'und') {
            push @{$entry->{record}}, [marker_with_code($marker, $code), $txt] if $messy;
            next;
          }
          next if $code eq 'und';
          if ($marker eq 'g') {
            $self->add_gloss($entry, 'gloss', $txt, $code, $seen_pos);
          } elsif ($marker eq 'x') {
            push @$seen_example, [$txt, $code] if $seen_example;
          }
          push @{$entry->{record}}, [marker_with_code($marker, $code), $txt];
        } else {
          if ($marker eq 'ps') {
            $seen_pos = $txt;
          } elsif ($marker eq 'xv') {
            $seen_example = $self->add_example($entry, $txt, $seen_pos);
          }
          push @{$entry->{record}}, [$marker, $txt];
        }
      } elsif ($messy) {
        push @{$entry->{record}}, ['?', $txt];
      }
    }

    $self->push_entry($entries, $entry);
  }

  return $entries;
}

sub code_from_lang {
  my ($self, $lang) = @_;
  if ($lang eq 'e') {
    return $self->lang_english;
  } elsif ($lang eq 'n') {
    return $self->lang_national;
  } elsif ($lang eq 'r') {
    return $self->lang_regional;
  } else {
    die "could not get code for $lang";
  }
}

sub merge_records_docx {
  my ($p) = @_;
  my @recs = $p->find('> span')->each;

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
        $r->append_content($recs[$j]->text);
        $recs[$j]->remove;
      }

      $i = $merge_until;
    }
  }
}

sub get_text_docx {
  return $_[0]->all_text =~ s/^\s+|\s+$//gr;
}

sub get_type_docx {
  return $_[0]->attr('class');
}

1;
