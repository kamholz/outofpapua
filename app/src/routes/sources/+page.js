import { error } from '@sveltejs/kit';
import { normalizeQuery, serializeQuery } from '$lib/util';
import * as suggest from '$actions/suggest';

export async function load({ fetch, session, url: { searchParams } }) {
  const data = {};
  if (session.user) {
    data.protolangSuggest = await suggest.protolang(fetch);
    if (!data.protolangSuggest) {
      throw error(500);
    }
  }

  const json = await reload(fetch, normalizeQuery(searchParams));
  if (!json) {
    throw error(500);
  }
  Object.assign(data, json);

  return data;
}

export async function reload(fetch, query) {
  const res = await fetch('/api/source' + serializeQuery({ ...query, details: 1 }));
  return res.ok ? res.json() : null;
}
