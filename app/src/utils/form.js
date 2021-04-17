export function normalizeQuery(urlSearchParams) {
  const query = Object.fromEntries(urlSearchParams);
  for (const attr in query) {
    query[attr] = normalizeValue(query[attr]);
    if (query[attr] === null) {
      delete query[attr];
    }
  }
  return query;
}

function normalizeValue(txt) {
  txt = txt.trim();
  return txt === '' ? null : txt;
}
