import { ensureNfcParams, getFilteredParams, mungeRegex, normalizeQuery, parseBooleanParams } from '$lib/util';
import { errorStrings, jsonError } from '$lib/error';
import { json } from '@sveltejs/kit';
import { knex } from '$lib/db';
import { requireAuth } from '$lib/auth';

const allowed = new Set(['entry_id', 'exclude_grouped', 'id', 'max', 'search']);
const required = new Set(['search']);
const boolean = new Set(['exclude_grouped']);
const nfc = new Set(['search']);
const defaults = {
  exclude_grouped: false,
  max: 250,
};

const name_auto = "coalesce(sd.name_auto ->> 'txt', sd.id::text)";

export const GET = requireAuth(async ({ url: { searchParams } }) => {
  const query = getFilteredParams(normalizeQuery(searchParams), allowed);
  if (Object.keys(getFilteredParams(query, required)).length !== required.size) {
    return jsonError(errorStrings.missing);
  }
  parseBooleanParams(query, boolean);
  ensureNfcParams(query, nfc);
  const { max, search } = { ...defaults, ...query };
  const q = knex('set')
    .join('set_details_cached as sd', 'sd.id', 'set.id')
    .where(knex.raw(name_auto), '~*', knex.raw('degr_regex(?)', mungeRegex(search)))
    .select(
      'set.id',
      knex.raw(`${name_auto} as name`),
      'set.set_group_id'
    )
    .orderBy(knex.raw("sd.name_auto ->> 'txt'"))
    .orderBy(knex.raw("lpad(sd.id::text, 10, '0')"))
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

  if (query.exclude_grouped) {
    q.whereNull('set.set_group_id');
  }

  try {
    return json({ rows: await q });
  } catch (e) {
    console.log(e);
    return json({ rows: [] });
  }
});
