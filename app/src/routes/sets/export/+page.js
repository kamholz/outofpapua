import { error } from '@sveltejs/kit';
import { normalizeQuery, serializeQuery } from '$lib/util';
import { requireAuthLoad } from '$actions/auth.js';
import * as suggest from '$actions/suggest';

export const load = requireAuthLoad(async ({ fetch, url: { searchParams } }) => {
  const query = normalizeQuery(searchParams);

  const data = {
    protolangSuggest: await suggest.protolang(fetch),
    query,
  };
  if (!data.protolangSuggest) {
    throw error(500);
  }

  if (query.protolang) {
    const res = await fetch('/api/set/export' + serializeQuery(query));
    if (!res.ok) {
      throw error(500);
    }
    const json = await res.json();
    Object.assign(data, json); // populates language, sets
  }

  return data;
});
