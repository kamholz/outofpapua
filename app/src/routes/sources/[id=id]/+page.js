import { error } from '@sveltejs/kit';
import * as suggest from '$actions/suggest';

export async function load({ fetch, params, session }) {
  const data = {};
  const res = await fetch(`/api/source/${params.id}`);
  if (!res.ok) {
    throw error(404);
  }
  data.source = await res.json();
  if (session.user) {
    if (data.source.editable) {
      data.protolangSuggest = await suggest.protolang(fetch);
      if (!data.protolangSuggest) {
        throw error(500);
      }
    }
    if (session.user.admin) {
      data.ipaConversionRuleSuggest = await suggest.ipaConversionRule(fetch);
      if (!data.ipaConversionRuleSuggest) {
        throw error(500);
      }
    }
  }
  return data;
}
