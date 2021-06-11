import config from '$config';
import { allowed, table } from './_params';
import { applyPageParams, applySortParams, getCount, knex, sendPgError, transaction } from '$lib/db';
import { getFilteredParams, isIdArray, normalizeQuery, parseBooleanParams } from '$lib/util';
import { requireAuth } from '$lib/auth';

const allowedSearch = new Set(['asc', 'page', 'pagesize', 'sort']);
const boolean = new Set(['asc']);
const defaults = {
  asc: true,
  page: 1,
  pagesize: Number(config.PAGESIZE),
  sort: 'name',
};
const sortCols = {
  name: "coalesce(set.name, lpad(set.id::text, 10, '0'))",
};

export async function get({ query }) {
  query = getFilteredParams(normalizeQuery(query), allowedSearch);
  parseBooleanParams(query, boolean);
  query = { ...defaults, ...query };

  const q = knex('set_with_members as set');

  const rowCount = await getCount(q);

  q.select(
    'set.id',
    'set.note',
    knex.raw('coalesce(set.name, set.id::text) as name'),
    'set.members'
  );

  const pageCount = applyPageParams(q, query, rowCount);
  applySortParams(q, query, sortCols, ['name']);

  const rows = await q;

  return {
    body: {
      query,
      pageCount,
      rowCount,
      rows,
    },
  };
}

export const post = requireAuth(async ({ body, locals }) => {
  let members;
  if ('members' in body) {
    if (!isIdArray(body.members)) {
      return { status: 400 };
    }
    ({ members } = body);
    delete body.members;
  }
  const params = getFilteredParams(body, allowed);
  try {
    const id = await transaction(locals, async (trx) => {
      const ids = await trx(table)
        .returning('id')
        .insert(params);
      const [id] = ids;
      if (members) {
        await trx('set_member')
          .insert(members.map((v) => ({ entry_id: v, set_id: id })));
        // would override existing set membership
        // .onConflict('entry_id')
        // .merge(['set_id']);
      }
      return id;
    });
    return { body: { id } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
