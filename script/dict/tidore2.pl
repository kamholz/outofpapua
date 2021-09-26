#!/usr/bin/env perl
use v5.14;
use utf8;
use Data::Dumper;
use File::Slurper qw/read_text/;
use JSON::MaybeXS;
use List::MoreUtils qw/first_index indexes/;
use List::Util 'any';
use Mojo::DOM;
binmode STDOUT, ':encoding(utf-8)';

my $note_start = qr/(?:See|Also)/;
my @records;

my $dom = Mojo::DOM->new(read_text('../dict/Tidore2/Tidore2_reformatted.html'));
$dom->find('sub')->map('remove'); # ignore subscripts

ENTRY:
foreach my $entry ($dom->find('p')->each) {
  next unless $entry->at('font');

  my $state = 'initial';
  my $record = [];
  my ($lx, @nt, $hint, $last_hint, $seen_gloss, $seen_pos);

  foreach my $node ($entry->child_nodes->each) {
    no warnings 'uninitialized';
    my $txt = get_text($node);
    next unless length $txt;
    $hint = undef;
    if ($node->type eq 'text' or $node->tag =~ /^(?:span|sup)$/) {
      if ($state eq 'initial' or $state eq 'subentry') {
        if ($txt eq ',') { # multiple headwords
          $lx .= ', ';
          next;
        }
        if ($state eq 'initial') { # main entry
          push_headword($record, 'lx', $lx);        
        } else { # subentry
          push @records, $record;
          $record = [];
          push_headword($record, 'se', $lx);
        }
        $state = 'gloss';
      }
      if ($state eq 'gloss' and (!$seen_pos or $txt =~ /^(; ?)?\d\b/)) {
        my $paren;
        ($txt, $paren) = get_parenthetical($txt);
        $txt =~ s/^; ?//;
        while (length $txt) {
          if ($txt =~ /^(\d+)\b ?(.*?)$/) {
            $txt = $2;
            push @$record, ['sn', $1];
          }
          if ($txt =~ /^(.+?)(?=\d\b|$)(.*)$/) {
            $txt = $2;
            my $gloss = $1 =~ s/ ?[,;.]* ?$//r;
            if ($gloss =~ /^(\(.+?\))(?: (.+))?$/) {
              my ($nt, $rest) = ($1, $2);
              if ($nt !~ /^\((?:also|catch|colour|just|keep in|part of\?|still)\)$/) {
                push @nt, $nt;
                $gloss = $rest;
              }
            }
            if (length $gloss) {
              push @$record, ['g_Eng', $gloss];
              $seen_gloss = 1;
            }
          }
        }
        push_parenthetical($record, $paren) if length $paren;      
      } else {
        $hint = 'boundary' if $txt =~ s/ ?;$//;
        my ($before, $paren) = get_parenthetical($txt);
        if (length $paren) {
          push @nt, $before if length $before;
          push_note($record, @nt);
          @nt = ();
          push_parenthetical($record, $paren);
          $hint = 'boundary';
        } else {
          push @nt, $txt;
          $state = 'note';
        }
      }
    } else {
      if ($node->tag eq 'font') {
        if ($state eq 'initial') {
          $lx .= $txt;
          $lx .= ' ' if $lx =~ /,$/;
        } elsif ($state eq 'note') {
          push @nt, $txt;
        }
      } elsif ($node->tag eq 'i') {
        next ENTRY if $txt =~ /^$note_start/ && !$seen_gloss;
        if ($state eq 'gloss') {
          if (!$seen_pos and $txt !~ /^$note_start/) {
            $hint = 'boundary' if $txt =~ s/ ?;$//;
            if ($txt =~ m{^([a-z]+\.\??(?: ?[;/] ?[a-z]+\.)*(?: *\([^()]+\))?) *(.*?)$}) {
              push @$record, ['ps', $1];
              if (length $2) {
                push @nt, $2;
                $state = 'note';              
              }
            } else {
              push @$record, ['ps', $txt] if $txt ne '.';
            }
            $seen_pos = 1;
            next;          
          } elsif ($txt =~ m{^([a-z]+\.?\??(?: ?[;/] ?[a-z]+\.?)*);?$}) {
            push @$record, ['ps', $1];
            next;
          }
        }
        push @nt, $txt;
        $state = 'note';
        $hint = 'boundary' if $txt =~ /\)$/;
      } elsif ($node->tag eq 'b') {
        if ($last_hint eq 'boundary' or $state eq 'gloss') {
          if (@nt) {
            push_note($record, @nt);
            @nt = ();
          }
          $lx = $txt;
          $lx .= ' ' if $lx =~ /,$/;
          $seen_gloss = $seen_pos = 0;
          $state = 'subentry';
        } elsif ($state eq 'subentry') {
          $lx .= $txt;
          $lx .= ' ' if $lx =~ /,$/;
        } else {
          push @nt, $txt;
          $state = 'note';
        }
      } else {
        say "unknown element: ", $node->to_string;
      }
    }
  } continue {
    $last_hint = $hint;
  }
  push_note($record, @nt);
  push @records, $record;
}

foreach my $record (@records) {
  my $lx_idx = first_index { $_->[0] eq 'ph' } @$record;
  $lx_idx = first_index { $_->[0] eq 'lx' or $_->[0] eq 'se' } @$record if $lx_idx == -1;

  # reorder \ps
  my @ps_idx = indexes { $_->[0] eq 'ps' } @$record;
  if (@ps_idx > 1) {
    my @sn_idx = indexes { $_->[0] eq 'sn' } @$record;
    if (@ps_idx == @sn_idx) {
      for (my $i = 0; $i < @ps_idx; $i++) {
        splice(@$record, $sn_idx[$i] + 1, 0, splice(@$record, $ps_idx[$i], 1));
      }
    } else {
      say "mismatched ps/sn count";
      print Dumper($record);
    }
  } elsif (@ps_idx == 1) {
    splice(@$record, $lx_idx + 1, 0, splice(@$record, $ps_idx[0], 1));
  }

  for (my $i = 0; $i < @$record; $i++) {
    my $line = $record->[$i];

    if ($line->[0] eq 'nt') {
      if ($line->[1] =~ /^See(?: also)?:? (.+?)\.?$/) { # crossref
        ($line->[0], $line->[1]) = ('cf', $1);
      } elsif ($line->[1] =~ /^Also:? (.+?)\.?$/) { # variant
        ($line->[0], $line->[1]) = ('va', $1);
        splice(@$record, $lx_idx + 1, 0, splice(@$record, $i, 1));
      }
    } elsif ($line->[0] eq 'et') {
      $line->[1] =~ s/\bAr?\./Arabic/g;
      $line->[1] =~ s/\bAn\./Austronesian/g;
      $line->[1] =~ s/\bDu\./Dutch/g;
      $line->[1] =~ s/\bEng?\./English/g;
      $line->[1] =~ s/\bJav\./Javanese/g;
      $line->[1] =~ s/\bM\./Malay/g;
      $line->[1] =~ s/\bPo?\./Portuguese/g;
      $line->[1] =~ s/ //g;
    }
  }
  say "\\$_->[0] $_->[1]" for @$record;
  print "\n";
}

sub get_text {
  my ($node) = @_;
  return trim($node->type eq 'text' ? $node->content : $node->all_text);
}

sub trim {
  my ($txt) = @_;
  $txt =~ s/\s{2,}/ /g;
  $txt =~ s/^ | $//g;
  $txt =~ s/\x{9}//g;
  return $txt;
}

sub push_headword {
  my ($record, $marker, $txt) = @_;
  my $stripped = $txt =~ s/ˈ//gr;
  push @$record, [$marker, $stripped];
  push @$record, ['ph', $txt] if $txt ne $stripped;
}

sub push_note {
  my ($record, @nt) = @_;
  # shift @nt if @nt && $nt[0] =~ /^[;]$/;
  return unless @nt;
  my $txt = '';
  for (my $i = 0; $i < @nt; $i++) {
    my $chunk = $nt[$i];
    if ($i > 0 and $chunk !~ /^[.,;:]/ and !($chunk =~ /^ˈ/ and $nt[$i - 1] !~ /[:,]$/) and !($nt[$i - 1] =~ /ˈ$/)) {
      $txt .= ' ';
    }
    $txt .= $chunk;
  }
  $txt =~ s/^[.,] ?//;

  if ($txt =~ /^\((.+?)\) *(.*)$/) {
    push @$record, ['nt', $1];
    $txt = $2;
  }

  push @$record, ['nt', $txt] if length $txt;
}

sub get_parenthetical {
  my ($txt) = @_;
  if ($txt =~ /^(.*?) ?\(([^()]+\.\??)\)$/) {
    return ($1, $2);
  } else {
    return ($txt, undef);
  }
}

sub push_parenthetical {
  my ($record, $txt) = @_;
  if ($txt =~ /\.\??$/) {
    push @$record, ['et', $txt];
  } else {
    push @$record, ['nt', $txt];
  }
}