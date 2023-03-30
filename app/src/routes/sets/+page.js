import { error } from '@sveltejs/kit';
import { normalizeQuery } from '$lib/util';
import * as suggest from '$actions/suggest';

export async function load({ fetch, parent, url: { searchParams } }) {
  const { preferences, user } = await parent();
  const data = {
    setAuthorSuggest: await suggest.setAuthor(fetch),
    sourceSuggest: await suggest.source(fetch),
    langSuggest: await suggest.langPlus(fetch),
    glosslangSuggest: await suggest.glosslang(fetch),
  };
  if (!data.sourceSuggest || !data.langSuggest || !data.glosslangSuggest) {
    throw error(500);
  }
  if (user) {
    data.borrowlangSuggest = await suggest.borrowlang(fetch);
    if (!data.borrowlangSuggest) {
      throw error(500);
    }
  }

  const query = normalizeQuery(searchParams);

  if (hasRequiredQueryParam(query)) {
    query.pagesize ??= preferences.listPageSize;

    const res = await fetch('/api/set?' + new URLSearchParams(query));
    if (!res.ok) {
      throw error(500);
    }
    const json = await res.json();
    Object.assign(data, json); // populates query, pageCount, rows, rowCount
  } else {
    data.query = {};
  }

  return data;
}

const requiredParams = new Set(['headword', 'headword_ipa', 'gloss', 'note', 'author_id', 'source', 'lang', 'glosslang']);

function hasRequiredQueryParam(query) {
  return Object.entries(query).some(([key, value]) => {
    return requiredParams.has(key) && value?.length;
  });
}