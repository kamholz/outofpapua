import { error } from '@sveltejs/kit';
import * as suggest from '$actions/suggest';

export async function load({ fetch, params, parent }) {
  const { user } = await parent();
  const data = {};
  const res = await fetch(`/api/language/${params.id}`);
  if (!res.ok) {
    throw error(404);
  }
  data.language = await res.json();
  if (user) {
    data.protolangSuggest = await suggest.protolang(fetch);
    data.regionSuggest = await suggest.region(fetch);
  }
  return data;
}
