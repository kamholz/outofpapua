import { error } from '@sveltejs/kit';
import { normalizeQuery, parseArrayNumParams, parseArrayParams, serializeQuery } from '$lib/util';
import * as suggest from '$actions/suggest';

const arrayParams = new Set(['lang', 'region']);
const arrayNumParams = new Set(['source']);

export async function load({ fetch, parent, url: { searchParams } }) {
  const { user } = await parent();
  const data = {
    sourceSuggest: await suggest.source(fetch),
    langSuggest: await suggest.langPlus(fetch),
    regionSuggest: await suggest.region(fetch),
  };
  if (!data.sourceSuggest || !data.langSuggest || !data.regionSuggest) {
    throw error(500);
  }
  if (user) {
    data.borrowlangSuggest = await suggest.borrowlang(fetch);
    if (!data.borrowlangSuggest) {
      throw error(500);
    }
  }

  const query = normalizeQuery(searchParams);
  if (['record', 'record_marker'].some((attr) => attr in query)) {
    const res = await fetch('/api/record' + serializeQuery(query));
    if (!res.ok) {
      throw error(500);
    }
    const json = await res.json();
    Object.assign(data, json); // populates query, pageCount, rows, rowCount
  } else {
    parseArrayParams(query, arrayParams);
    parseArrayNumParams(query, arrayNumParams);
    if (!('langcat' in query)) {
      query.langcat = 'lang';
    }
    data.query = query;
  }

  return data;
}
