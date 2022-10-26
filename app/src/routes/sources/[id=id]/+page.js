import { error } from '@sveltejs/kit';
import { isEditor } from '$lib/util';
import * as suggest from '$actions/suggest';

export async function load({ fetch, params, parent }) {
  const { user } = await parent();
  const data = {};
  const res = await fetch(`/api/source/${params.id}`);
  if (!res.ok) {
    throw error(404);
  }
  data.source = await res.json();
  if (user) {
    if (data.source.editable) {
      data.protolangSuggest = await suggest.protolang(fetch);
      if (!data.protolangSuggest) {
        throw error(500);
      }
    }
    if (isEditor(user)) {
      data.ipaConversionRuleSuggest = await suggest.ipaConversionRule(fetch);
      data.langSuggest = await suggest.lang(fetch);
      if (!(data.ipaConversionRuleSuggest || data.langSuggest)) {
        throw error(500);
      }
    }
  }
  return data;
}
