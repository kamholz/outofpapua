import { error } from '@sveltejs/kit';
import { normalizeQuery, parseArrayNumParams } from '$lib/util';
import * as suggest from '$actions/suggest';

const arrayNumParams = new Set(['glosslang']);

export async function load({ fetch, parent, url: { searchParams } }) {
  const { user } = await parent();
  const data = {
    langSuggest: await suggest.langPlus(fetch),
    glosslangSuggest: await suggest.glosslang(fetch),
  };
  if (!data.langSuggest || !data.glosslangSuggest) {
    throw error(500);
  }
  if (user) {
    data.borrowlangSuggest = await suggest.borrowlang(fetch);
    if (!data.borrowlangSuggest) {
      throw error(500);
    }
  }

  const query = normalizeQuery(searchParams);
  if ('lang1' in query && 'lang2' in query) {
    const res = await fetch('/api/entry/compare?' + new URLSearchParams(query));
    if (!(res.ok || res.status === 400)) {
      throw error(500);
    }
    const json = await res.json();
    Object.assign(data, json); // populates query, pageCount, rows, rowCount (or error)
  } else {
    parseArrayNumParams(query, arrayNumParams);
    if (!('set' in query)) {
      query.set = 'both';
    }
    data.query = query;
  }

  return data;
}

