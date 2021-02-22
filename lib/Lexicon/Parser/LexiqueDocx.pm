package Lexicon::Parser::LexiqueDocx;
use v5.14;
use Moo;
use namespace::clean;
use List::Util 'uniqstr';

extends 'Lexicon::Parser::XML';
with 'Lexicon::Util';

sub read_entries {
  my ($self) = @_;
  my $dom = $self->parse;
  my @entries;

  foreach my $p ($dom->find('p')->each) {
    next unless $p->at('pStyle[val="EntryParagraph"]') || $p->at('pStyle[val="IndentedParagraph"]');
    merge_records_docx($p);

    my $row;

    foreach my $r ($p->find('r')->each) {
      my $type = get_type_docx($r);
      next unless length $type;
      my $txt = get_text_docx($r);
      $txt =~ s/\s*\.+$// if $type =~ /^(?:DefinitionE|Definition[nr])$/;
      next unless length $txt;

      if ($type eq 'Lexeme' or $type eq 'Subentry') {
        $row->{headword} = normalize_headword($txt);
        push @{$row->{record}}, ['lx', $row->{headword}];
      } elsif ($type eq 'DefinitionE') {
        push @{$row->{gloss}}, $self->extract_glosses($txt);
        push @{$row->{record}}, ['ge', $txt];
      } elsif ($type eq 'Partofspeech') {
        push @{$row->{record}}, ['ps', $txt];
      } elsif ($type eq 'Definitionn') {
        push @{$row->{record}}, ['gn', $txt];
      } elsif ($type eq 'Examplev') {
        push @{$row->{record}}, ['xv', $txt];
      } elsif ($type eq 'ExamplefreetransE') {
        push @{$row->{record}}, ['xe', $txt];
      } elsif ($type eq 'Examplefreetransn') {
        push @{$row->{record}}, ['xn', $txt];
      } elsif ($type eq 'Examplefreetransr') {
        #push @{$row->{record}}, ['xr', $txt];
      } elsif ($type =~ /^(?:flabel|Reference|Definitionr|Encyclopedicinfo[Er]|Notesgeneral)$/) {
        $txt =~ s/\s*\.+$//;
        push @{$row->{record}}, ['', $txt] if length $txt;
      }
    }

    if ($row->{headword} && $row->{gloss}) {
      push(@entries, { %$row, gloss => $_ }) for uniqstr(@{$row->{gloss}});
    }
  }

  return \@entries;
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
