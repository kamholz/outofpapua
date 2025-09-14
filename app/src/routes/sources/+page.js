import { error } from '@sveltejs/kit';
import { normalizeQuery, parseBooleanParams, serializeQuery } from '$lib/util';
import * as suggest from '$actions/suggest';

const boolean = new Set(['editor_mode']);

const defaults = {
  editor_mode: false,
};

export async function load({ fetch, parent, url: { searchParams } }) {
  let query = normalizeQuery(searchParams);
  parseBooleanParams(query, boolean);
  query = { ...defaults, ...query };

  const data = {
    langSuggest: await suggest.langPlus(fetch),
    query,
  };

  const { user } = await parent();
  if (user) {
    data.protolangSuggest = await suggest.protolang(fetch);
    if (!data.protolangSuggest) {
      throw error(500);
    }
  }

  const res = await fetch('/api/source' + serializeQuery({ ...query, details: 1 }));
  if (!res.ok) {
    throw error(500);
  }
  const json = await res.json();
  Object.assign(data, json);

  return data;
}
