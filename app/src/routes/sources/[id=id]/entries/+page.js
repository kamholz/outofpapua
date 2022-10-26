import { error } from '@sveltejs/kit';
import { optionalQuery } from '$lib/util';
import * as suggest from '$actions/suggest';

export async function load({ fetch, params, url: { searchParams } }) {
  const data = {
    borrowlangSuggest: await suggest.borrowlang(fetch),
  };
  if (!data.borrowlangSuggest) {
    throw error(500);
  }

  const res = await fetch(`/api/source/${params.id}`);
  if (!res.ok) {
    throw error(404);
  }
  data.source = await res.json();
  const json = await reload(fetch, params.id, searchParams);
  if (!json) {
    throw error(500);
  }
  Object.assign(data, json); // populates query, pageCount, rows, rowCount

  return data;
}

export async function reload(fetch, id, searchParams) {
  const res = await fetch(`/api/source/${id}/entries` + optionalQuery(searchParams));
  return res.ok ? res.json() : null;
}
