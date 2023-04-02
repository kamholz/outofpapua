import { arrayCmp, knex, name_auto } from '$lib/db';
import { getFilteredParams, isIdArray, jsonError, normalizeQuery, parseArrayNumParams,
  showPublicOnly } from '$lib/util';
import { json } from '@sveltejs/kit';
import { pageMax } from '$lib/preferences';
import { requireComparative } from '$lib/auth';

const allowed = new Set(['ids']);
const arrayNumParams = new Set(['ids']);

export const GET = requireComparative(async ({ locals, url: { searchParams } }) => {
  const query = getFilteredParams(normalizeQuery(searchParams), allowed);
  if (!Object.keys(query).length) {
    return jsonError('insufficient parameters');
  }
  parseArrayNumParams(query, arrayNumParams);
  if (!isIdArray(query.ids)) {
    return jsonError('invalid ids parameter');
  }
  if (query.ids.length > pageMax) {
    return jsonError(`cannot request more than ${pageMax} sets`);
  }

  const q = knex('set')
    .join(`${showPublicOnly(locals) ? 'set_details_cached_public' : 'set_details_cached'} as sd`, 'sd.id', 'set.id')
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

  return json({ rows: await q });
});
