import { error } from '@sveltejs/kit';
import * as suggest from '$actions/suggest';

export async function load({ fetch, params, parent }) {
  const { user } = await parent();
  const data = {};
  if (user) {
    data.borrowlangSuggest = await suggest.borrowlang(fetch);
    data.langSuggest = await suggest.langPlus(fetch);
    data.sourceSuggest = await suggest.editableSource(fetch);
    if (!data.borrowlangSuggest || !data.langSuggest || !data.sourceSuggest) {
      throw error(500);
    }
  }

  data.set = await reload(fetch, params.id);
  if (!data.set) {
    throw error(404);
  }

  return data;
}

export async function reload(fetch, id) {
  const res = await fetch(`/api/set/${id}`);
  return res.ok ? res.json() : null;
}
