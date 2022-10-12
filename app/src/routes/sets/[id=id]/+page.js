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

  const res = await fetch(`/api/set/${params.id}`);
  if (!res.ok) {
    throw error(404);
  }
  data.set = await res.json();

  return data;
}

