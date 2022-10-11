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
    const json = await reload(fetch, query);
    if (!json) {
      throw error(500);
    }
    Object.assign(data, json); // populates query, pageCount, rows, rowCount (or error)
  } else {
    parseArrayNumParams(query, arrayNumParams);
    data.query = query;
  }

  return data;
}

export async function reload(fetch, query) {
  const res = await fetch('/api/entry/compare?' + new URLSearchParams(query));
  return res.ok || res.status === 400 ? res.json() : null;
}
