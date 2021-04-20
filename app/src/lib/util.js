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

export function pageUrl(page) {
  let url = `http://${page.host}${page.path}`;
  if (page.query.values().next().done) { // no query params
    return url;
  } else {
    return url + '?' + page.query.toString();
  }
}

export function boolean(value) {
  return value ? 'yes' : 'no';
}
