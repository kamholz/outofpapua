import { error } from '@sveltejs/kit';
import { normalizeQuery, parseBooleanParams } from '$lib/util';
import { requireAuthLoad } from '$actions/auth.js';
import * as suggest from '$actions/suggest';

const boolean = new Set(['note', 'descendants', 'orthography', 'ipa', 'borrowed', 'ancestors', 'ancestor_glosses']);

const defaults = {
  note: false,
  descendants: true,
  orthography: true,
  ipa: true,
  borrowed: false,
  ancestors: false,
  ancestor_glosses: false,
};

export const load = requireAuthLoad(async ({ fetch, url: { searchParams } }) => {
  let query = normalizeQuery(searchParams);
  parseBooleanParams(query, boolean);
  query = { ...defaults, ...query };

  const data = {
    protolangSuggest: await suggest.protolang(fetch),
    query,
  };
  if (!data.protolangSuggest) {
    throw error(500);
  }

  if (query.protolang) {
    query.protolang = Number(query.protolang);
    const res = await fetch(`/api/language/${query.protolang}/export_proto`);
    if (!res.ok) {
      throw error(500);
    }
    const json = await res.json();
    Object.assign(data, json); // populates language, sets
  }

  return data;
});
