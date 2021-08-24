import { arrayCmp, knex } from '$lib/db';
import { getFilteredParams, isIdArray, normalizeQuery, parseArrayNumParams, showPublicOnly } from '$lib/util';
import { pageMax } from '$lib/preferences';

const allowed = new Set(['ids']);
const arrayNumParams = new Set(['ids']);

export async function get({ locals, query }) {
  query = getFilteredParams(normalizeQuery(query), allowed);
  if (!Object.keys(query).length) {
    return { status: 400, body: { error: 'insufficient parameters' } };
  }
  parseArrayNumParams(query, arrayNumParams);
  if (!isIdArray(query.ids)) {
    return { status: 400, body: { error: 'invalid ids parameter' } };
  }
  if (query.ids.length > pageMax) {
    return { status: 400, body: { error: `cannot request more than ${pageMax} entries` } };
  }

  const q = knex(`${showPublicOnly(locals) ? 'entry_with_details_public' : 'entry_with_details'} as entry`)
    .where('entry.id', arrayCmp(query.ids))
    .select(
      'entry.id',
      'entry.headword',
      'entry.headword_normalized',
      'entry.root',
      'entry.note',
      'entry.origin',
      'entry.origin_language_id',
      'entry.origin_language_name',
      'entry.record_id',
      'entry.senses',
      'entry.source',
      'entry.language'
    );

  return {
    body: {
      rows: await q,
    },
  };
}
