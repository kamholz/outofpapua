import { arrayCmp, knex, name_auto } from '$lib/db';
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
    return { status: 400, body: { error: `cannot request more than ${pageMax} sets` } };
  }

  const q = knex('set')
    .join(`${showPublicOnly(locals) ? 'set_details_public' : 'set_details'} as sd`, 'sd.id', 'set.id')
    .where('set.id', arrayCmp(query.ids))
    .select(
      'set.id',
      'set.author_id',
      'sd.author_name',
      'set.name',
      knex.raw(name_auto),
      'set.note',
      'sd.members'
    );

  return {
    body: {
      rows: await q,
    },
  };
}
