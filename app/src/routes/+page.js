import { error } from '@sveltejs/kit';
import { normalizeQuery, parseArrayNumParams, parseArrayParams, serializeQuery } from '$lib/util';
import * as suggest from '$actions/suggest';

const arrayParams = new Set(['lang']);
const arrayNumParams = new Set(['glosslang']);

export async function load({ fetch, url: { searchParams } }) {
  const data = {
    langSuggest: await suggest.langPlus(fetch),
    glosslangSuggest: await suggest.glosslang(fetch),
    borrowlangSuggest: await suggest.borrowlang(fetch),
  };
  if (!data.langSuggest || !data.glosslangSuggest || !data.borrowlangSuggest) {
    throw error(500);
  }

  const query = normalizeQuery(searchParams);
  if (['borrowlang', 'gloss', 'headword', 'headword_ipa', 'record'].some((attr) => attr in query)) {
    const json = await reload(fetch, query);
    if (!json) {
      throw error(500);
    }
    Object.assign(data, json); // populates query, pageCount, rows, rowCount
  } else {
    parseArrayParams(query, arrayParams);
    parseArrayNumParams(query, arrayNumParams);
    if (!('langcat' in query)) {
      query.langcat = 'lang';
    }
    if (!('set' in query)) {
      query.set = 'both';
    }
    if (!('origin' in query)) {
      query.origin = 'all';
    }
    data.query = query;
  }

  return data;
}

export async function reload(fetch, query) {
  const res = await fetch('/api/entry' + serializeQuery(query));
  return res.ok ? res.json() : null;
}
