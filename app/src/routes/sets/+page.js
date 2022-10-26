import { error } from '@sveltejs/kit';
import { normalizeQuery } from '$lib/util';
import * as suggest from '$actions/suggest';

export async function load({ fetch, session, url: { searchParams } }) {
  const data = {
    setAuthorSuggest: await suggest.setAuthor(fetch),
    sourceSuggest: await suggest.source(fetch),
    langSuggest: await suggest.langPlus(fetch),
    glosslangSuggest: await suggest.glosslang(fetch),
  };
  if (!data.sourceSuggest || !data.langSuggest || !data.glosslangSuggest) {
    throw error(500);
  }
  if (session.user) {
    data.borrowlangSuggest = await suggest.borrowlang(fetch);
    if (!data.borrowlangSuggest) {
      throw error(500);
    }
  }

  const query = normalizeQuery(searchParams);
  query.pagesize ??= session.preferences.listPageSize;
  const json = await reload(fetch, query, session.preferences);
  if (!json) {
    throw error(500);
  }
  Object.assign(data, json); // populates query, pageCount, rows, rowCount

  return data;
}

export async function reload(fetch, query) {
  const res = await fetch('/api/set?' + new URLSearchParams(query));
  return res.ok ? res.json() : null;
}
