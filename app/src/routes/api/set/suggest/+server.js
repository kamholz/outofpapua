import errors from '$lib/errors';
import { ensureNfcParams, getFilteredParams, jsonError, mungeRegex, normalizeQuery } from '$lib/util';
import { json } from '@sveltejs/kit';
import { knex } from '$lib/db';
import { requireAuth } from '$lib/auth';

const allowed = new Set(['entry_id', 'id', 'max', 'search']);
const required = new Set(['search']);
const nfc = new Set(['search']);
const defaults = {
  max: 250,
};

const name_auto = "coalesce(sna.name_auto->>'txt', set.id::text)";

export const GET = requireAuth(async ({ url: { searchParams } }) => {
  const query = getFilteredParams(normalizeQuery(searchParams), allowed);
  if (Object.keys(getFilteredParams(query, required)).length !== required.size) {
    return jsonError(errors.missing);
  }
  ensureNfcParams(query, nfc);
  const { max, search } = { ...defaults, ...query };
  const q = knex('set')
    .join('set_name_auto as sna', 'sna.id', 'set.id')
    .where(knex.raw(name_auto), '~*', knex.raw('degr_regex(?)', mungeRegex(search)))
    .select('set.id', knex.raw(`${name_auto} as name`))
    .orderBy(knex.raw("sna.name_auto ->> 'txt'"))
    .orderBy(knex.raw("lpad(set.id::text, 10, '0')"))
    .limit(max);

  if ('id' in query) {
    q.where('set.id', '!=', query.id);
  }

  if ('entry_id' in query) {
    q.whereNotExists(function () {
      this
        .select('*')
        .from('set_member as sm')
        .where('sm.set_id', knex.ref('set.id'))
        .where('sm.entry_id', query.entry_id);
    });
  }

  try {
    return json({ rows: await q });
  } catch (e) {
    console.log(e);
    return json({ rows: [] });
  }
});
