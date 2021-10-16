package Lexicon::Util;
use v5.14;
use Moo::Role;
use Encode::Simple qw(decode decode_lax);
use Try::Tiny;
use Unicode::Normalize qw/NFC NFD/;

# param and string generation

sub to_array {
  return ref $_[0] eq 'ARRAY' ? $_[0] : [$_[0]];
}

sub to_array_map {
  return { map { $_ => 1 } @{to_array($_[0])} };
}

sub split_regex {
  my ($chars) = @_;
  return qr/\s*[$chars]\s*(?![^()]*\))/;
}

sub marker_with_code {
  my ($marker, $code) = @_;
  return $marker . '_' . ucfirst $code;
}

# string encoding and normalization

sub ensure_nfc {
  my ($txt) = @_;
  return defined $txt ? NFC($txt) : $txt;
}

sub normalize_headword {
  my ($txt) = @_;
  $txt =~ s/\s+/ /g;
  return $txt;
}

sub apply_encodings {
  my ($txt, $encodings) = @_;

  if (@$encodings == 1) {
    return decode_lax($encodings->[0], $txt);
  } else {
    foreach my $encoding (@$encodings) {
      try {
        my $new_txt = decode($encoding, $txt);
        return $new_txt;
      };
    }
  }

  return $txt;
}

# ISO 639 code conversion

my %code3 = (
  en => 'eng',
  id => 'ind',
);

sub code3 {
  my ($code) = @_;
  return $code3{$code} // $code;
}

# dom extraction

sub get_text_sil {
  my ($el) = @_;
  $el = $el->at('AStr Run');
  my $code = code3($el->attr('ws'));
  my $txt = $el->text;
  $txt =~ s/^\s+|\s+$//g;
  $txt =~ s/\s+/ /g;
  return ($txt, $code);
}

sub get_text_sil_lang {
  my ($el, $lang) = @_;
  my $run = $el->at(qq(AStr Run[ws="$lang"]));
  return undef unless $run;
  my $txt = $run->text;
  $txt =~ s/^\s+|\s+$//g;
  $txt =~ s/\s+/ /g;
  return $txt;
}

sub collect_record_sil {
  my ($record, $found, $marker) = @_;
  if ($found) {
    push @$record, [$marker, get_text_sil($found)];
  }
}

# db

sub select_single {
  my ($db, $query, @values) = @_;
  my $row = $db->query($query, @values)->array;
  return $row ? $row->[0] : undef;
}

1;
