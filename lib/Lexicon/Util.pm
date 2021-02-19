package Lexicon::Util;
use v5.14;
use Moo::Role;
use Encode::Simple qw(decode decode_lax);

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
      my $new_txt;
      eval { $new_txt = decode($encoding, $txt) };
      return $new_txt unless $@;
    }
  }

  return $txt;
}


1;
