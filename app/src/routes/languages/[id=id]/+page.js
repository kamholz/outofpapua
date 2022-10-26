import { error } from '@sveltejs/kit';
import * as suggest from '$actions/suggest';

export async function load({ fetch, params, session }) {
  const data = {};
  const res = await fetch(`/api/language/${params.id}`);
  if (!res.ok) {
    throw error(404);
  }
  data.language = await res.json();
  if (session.user) {
    data.protolangSuggest = await suggest.protolang(fetch);
  }
  return data;
}
