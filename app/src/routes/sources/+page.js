import { error } from '@sveltejs/kit';
import { normalizeQuery, serializeQuery } from '$lib/util';
import * as suggest from '$actions/suggest';

export async function load({ fetch, parent, url: { searchParams } }) {
  const { user } = await parent();
  const data = {
    langSuggest: await suggest.langPlus(fetch),
  };
  if (user) {
    data.protolangSuggest = await suggest.protolang(fetch);
    if (!data.protolangSuggest) {
      throw error(500);
    }
  }

  const res = await fetch('/api/source' + serializeQuery({ ...normalizeQuery(searchParams), details: 1 }));
  if (!res.ok) {
    throw error(500);
  }
  const json = await res.json();
  Object.assign(data, json);

  return data;
}

