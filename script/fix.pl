#!/usr/bin/env perl
use v5.14;
use lib 'perllib';
use Data::Dumper;
use Dotenv -load => 'app/.env';
use List::Util 'uniq';
use Mojo::Pg;

my $pg = Mojo::Pg->new;

my $POS_RE = ' \(((?:n|v)\.)\)';
my $ENG = 6986;

eval {
  my $db = $pg->db;
  my $tx = $db->begin;

  # fix_pos_in_gloss($db);
  fix_pos_in_gloss_multiple($db);

  $tx->commit;
};
say $@ if $@;

sub extract_pos {
  my ($txt) = @_;
  my $new_txt = $txt;
  my $match = $new_txt =~ s/$POS_RE *//;
  return $match
    ? { txt => $txt, new_txt => $new_txt, pos => $1 }
    : { txt => $txt, new_txt => $new_txt, pos => undef };
}

sub fix_pos_in_gloss {
  my ($db) = @_;
  my $rows = $db->query(<<'EOF', $POS_RE . '(?: |$)')->hashes;
SELECT sense_id, array_agg(txt) as glosses
FROM sense_gloss
WHERE txt ~ ?
GROUP BY sense_id
HAVING count(*) = 1
EOF

  foreach my $row (@$rows) {
    my $txt = $row->{glosses}[0];
    my $extracted = extract_pos($txt);
    if (!$extracted->{pos}) {
      say "no match: $txt";
      next;
    }
    say "$txt => $extracted->{pos} // $extracted->{new_txt}";
    update_pos($db, $row->{sense_id}, $extracted->{pos});
    update_gloss($db, $row->{sense_id}, $txt, $extracted->{new_txt});
  }
}

sub fix_pos_in_gloss_multiple {
  my ($db) = @_;
  my $rows = $db->query(<<'EOF', $POS_RE . '(?: |$)')->hashes;
SELECT sense_id, language_id, array_agg(txt) as glosses
FROM sense_gloss
WHERE txt ~ ?
GROUP BY sense_id, language_id
HAVING count(*) > 1
EOF

  foreach my $row (@$rows) {
    my $senses = $db->query(<<'EOF', $row->{sense_id})->hash;
SELECT entry_id, count(*)
FROM sense
WHERE entry_id = (SELECT entry_id FROM sense WHERE id = ?)
GROUP BY entry_id
EOF

    if ($senses->{count} > 1) {
      say "corresponding entry has multiple senses, not sure what to do";
      print Dumper($row);
      die;
    }

    my @extracted = map { extract_pos($_) } @{$row->{glosses}};

    if (uniq(map { $_->{pos} } @extracted) == 1) {
      my $pos = $extracted[0]{pos};
      update_pos($db, $row->{sense_id}, $pos);
      foreach my $item (@extracted) {
        say "$item->{txt} => $pos // $item->{new_txt}";
        update_gloss($db, $row->{sense_id}, $item->{txt}, $item->{new_txt});
      }
    } else {
      my $glosses = $db->query('SELECT language_id, txt FROM sense_glosses_by_language WHERE sense_id = ?',
        $row->{sense_id})->expand->hashes;

      if (@$glosses != 2) {
        say "sense glosses are not in exactly two languages, not sure what to do";
        print Dumper($glosses);
        die;
      }

      my ($glosses_target) = grep { $_->{language_id} == $row->{language_id} } @$glosses;
      my ($glosses_other) = grep { $_->{language_id} != $row->{language_id} } @$glosses;

      my $first_language_id = $db->query('SELECT language_id FROM sense_gloss WHERE sense_id = ? ORDER BY seq LIMIT 1',
        $row->{sense_id})->array->[0];
      my $target_first = $first_language_id == $glosses_target->{language_id};
      # say 'target_first: ' . ($target_first ? 'yes' : 'no');

      if (@{$glosses_target->{txt}} != @extracted) {
      # check if we have earlier glosses in sense without pos marking;
      # if we do, need to create all new senses
        my $seq = 2;
        foreach my $i (0 .. $#{$glosses_target->{txt}}) {
          foreach my $j (0 .. $#{$row->{glosses}}) {
            if ($glosses_target->{txt}[$i] eq $row->{glosses}[$j]) {
              $extracted[$j]{seq} = $seq++;
              $extracted[$j]{gloss_other} = $glosses_other->{txt}[$i];
              $extracted[$i]{gloss_other_action} = 'move';
              last;
            }
          }
        }
      } else {
      # otherwise, reuse the first sense;
      # copy the other language gloss across new senses
        $extracted[0]{sense_id} = $row->{sense_id};

        my $seq = 2;
        foreach my $i (1 .. @extracted - 1) {
          $extracted[$i]{seq} = $seq++;
          $extracted[$i]{gloss_other} = $glosses_other->{txt}[0];
          $extracted[$i]{gloss_other_action} = 'copy';
        }
      }

      say "entry id: $senses->{entry_id}";
      print Dumper(\@extracted);

      foreach my $item (@extracted) {
        if ($item->{sense_id}) {
          update_pos($db, $item->{sense_id}, $item->{pos});
          update_gloss($db, $item->{sense_id}, $item->{txt}, $item->{new_txt});
        } else {
          my $sense_id = add_sense($db, $senses->{entry_id}, $item->{seq}, $item->{pos});
          reassign_gloss($db, $row->{sense_id}, $sense_id, $item->{txt}, $item->{new_txt}, $target_first ? 1 : 2);
          if ($item->{gloss_other}) {
            my $seq = $target_first ? 2 : 1;
            if ($item->{gloss_other_action} eq 'move') {
              reassign_gloss($db, $row->{sense_id}, $sense_id, $item->{gloss_other}, $item->{gloss_other}, $seq);
            } else {
              add_gloss($db, $sense_id, $glosses_other->{language_id}, $item->{gloss_other}, $seq);
            }
          }
        }
      }
    }
  }
}

sub add_sense {
  my ($db, $entry_id, $seq, $pos) = @_;
  my $id = $db->query('INSERT INTO sense (entry_id, seq, pos) VALUES (?, ?, ?) RETURNING id',
    $entry_id, $seq, $pos)->array->[0];
  return $id;
}

sub update_pos {
  my ($db, $sense_id, $pos) = @_;
  $db->query('UPDATE sense SET pos = ? WHERE id = ?',
    $pos, $sense_id);
}

sub update_gloss {
  my ($db, $sense_id, $old_txt, $new_txt) = @_;
  $db->query('UPDATE sense_gloss SET txt = ? WHERE sense_id = ? AND txt = ?',
    $new_txt, $sense_id, $old_txt);
}

sub reassign_gloss {
  my ($db, $old_sense_id, $new_sense_id, $old_txt, $new_txt, $new_seq) = @_;
  if ($old_txt ne $new_txt) {
    $db->query('UPDATE sense_gloss SET sense_id = ?, txt = ?, seq = ? WHERE sense_id = ? AND txt = ?',
      $new_sense_id, $new_txt, $new_seq, $old_sense_id, $old_txt);
  } else {
    $db->query('UPDATE sense_gloss SET sense_id = ?, seq = ? WHERE sense_id = ? AND txt = ?',
      $new_sense_id, $new_seq, $old_sense_id, $old_txt);
  }
}

sub add_gloss {
  my ($db, $sense_id, $language_id, $txt, $seq) = @_;
  $db->query('INSERT INTO sense_gloss (sense_id, language_id, txt, seq) VALUES (?, ?, ?, ?)',
    $sense_id, $language_id, $txt, $seq);

}