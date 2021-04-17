export function normalize(txt) {
  txt = txt.trim();
  return txt === '' ? null : txt;
}
