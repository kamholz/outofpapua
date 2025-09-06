import { error } from '@sveltejs/kit';
import { ipaConversionFunctions } from '$actions/ipa_conversion_functions';
import { normalizeQuery, parseBooleanParams } from '$lib/util';
import { requireAuthLoad } from '$actions/auth.js';
import * as suggest from '$actions/suggest';

const boolean = new Set([
  'ancestor_glosses',
  'ancestor_source',
  'ancestors',
  'attested_note',
  'attested_source',
  'borrowed_attested',
  'borrowed_origin',
  'descendants',
  'ipa',
  'note',
  'orthography',
  'outborrowings',
  'outcomparisons',
  'set_note',
  'source',
]);

const defaults = {
  ancestor_glosses: false,
  ancestor_source: false,
  ancestors: false,
  attested_note: false,
  attested_source: true,
  borrowed_attested: false,
  borrowed_origin: false,
  descendants: true,
  ipa: true,
  note: true,
  orthography: true,
  outborrowings: false,
  outcomparisons: false,
  set_note: true,
  source: true,
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
    data.ipaFunctions = await ipaConversionFunctions(fetch, json.ipa_conversion_functions);
    delete json.ipa_conversion_functions;
    Object.assign(data, json); // populates language, entries
  }

  return data;
});
