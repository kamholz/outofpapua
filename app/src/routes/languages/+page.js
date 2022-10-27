import { error } from '@sveltejs/kit';
import { isEditor, normalizeQuery, serializeQuery } from '$lib/util';

export async function load({ fetch, parent, url: { searchParams } }) {
  const { user } = await parent();
  const data = {};

  const res = await fetch('/api/language' + serializeQuery({ ...normalizeQuery(searchParams), details: 1 }));
  if (!res.ok) {
    throw error(500);
  }
  const json = await res.json();
  Object.assign(data, json);

  if (isEditor(user)) {
    data.langSuggest = data.rows
      .filter((row) => !row.is_proto && !row.is_dialect);
  }

  return data;
}
