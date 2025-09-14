import { error } from '@sveltejs/kit';
import { isEditor, normalizeQuery, parseBooleanParams, serializeQuery } from '$lib/util';
import * as suggest from '$actions/suggest';

const boolean = new Set(['editor_mode']);

const defaults = {
  editor_mode: false,
};

export async function load({ fetch, parent, url: { searchParams } }) {
  let query = normalizeQuery(searchParams);
  parseBooleanParams(query, boolean);
  query = { ...defaults, ...query };

  const { user } = await parent();
  const data = {
    protolangSuggest: await suggest.protolang(fetch),
  };
  if (user && query.editor_mode) {
    data.regionSuggest = await suggest.region(fetch);
  }

  const res = await fetch('/api/language' + serializeQuery({ ...query, details: 1 }));
  if (!res.ok) {
    throw error(500);
  }
  const json = await res.json();
  Object.assign(data, json);

  if (isEditor(user)) {
    data.dialectLangSuggest = data.rows
      .filter((row) => !row.is_proto && !row.is_dialect);
  }

  return data;
}
