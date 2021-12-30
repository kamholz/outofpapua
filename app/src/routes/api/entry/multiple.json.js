import { arrayCmp, knex } from '$lib/db';
import { getFilteredParams, hideComparativeInEntry, isIdArray, normalizeQuery, parseArrayNumParams,
  showPublicOnly } from '$lib/util';
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

  const q = knex('entry')
    .join(`${showPublicOnly(locals) ? 'entry_details_public' : 'entry_details'} as ed`, 'ed.id', 'entry.id')
    .where('entry.id', arrayCmp(query.ids))
    .select(
      'entry.id',
      'entry.headword',
      'entry.headword_ipa',
      'entry.root',
      'entry.origin',
      'entry.origin_language_id',
      'ed.origin_language_name',
      'entry.record_id',
      'ed.senses',
      'ed.source',
      'ed.language'
    );

  const rows = await q;
  if (locals.hideComparative) {
    for (const row of rows) {
      hideComparativeInEntry(row);
    }
  }

  return {
    body: {
      rows,
    },
  };
}
