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

  const sourceRes = await fetch(`/api/source/${params.id}`);
  if (!sourceRes.ok) {
    throw error(404);
  }
  data.source = await sourceRes.json();

  const entriesRes = await fetch(`/api/source/${params.id}/entries` + optionalQuery(searchParams));
  if (!entriesRes.ok) {
    throw error(500);
  }
  const json = await entriesRes.json();
  Object.assign(data, json); // populates query, pageCount, rows, rowCount

  return data;
}
