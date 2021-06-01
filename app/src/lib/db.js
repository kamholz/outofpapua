import config from '$config';
import knexModule from 'knex';
import { mungeRegex } from '$lib/util';

const knex = knexModule({
  client: 'pg',
  connection: {
    host: config.PGHOST,
    database: config.PGDATABASE,
  },
});
export { knex as knex };

export function transaction(locals, cb) {
  const userId = locals.user?.id;
  return knex.transaction(async (trx) => {
    if (userId) {
      await trx.select(knex.raw("set_config('outofpapua.usr_id', ?::text, true)", userId));
    }
    return cb(trx);
  });
}

export function arrayCmp(param) {
  return param.length === 1
    ? param[0]
    : knex.raw('any(?)', [[...param]]);
}

// pagination and sorting

const pageMax = 1000;

export function applyPageParams(q, query, count) {
  const pageSize = Math.min(query.pagesize, pageMax);
  const pageCount = Math.ceil(count / pageSize);

  let page = Number(query.page);
  if (page < 1) {
    page = 1;
  } else if (page > pageCount) {
    page = pageCount;
  }

  q.limit(pageSize);
  if (page > 1) {
    q.offset((page - 1) * pageSize);
  }

  query.page = page;
  query.pagesize = pageSize;

  return pageCount;
}

export function applySortParams(q, query, sortCols, restCols) {
  const querySort = 'sort' in query && query.sort in sortCols && query.sort;
  if (querySort) {
    q.orderByRaw(sortCols[querySort] + (query.asc ? ' asc nulls last' : ' desc nulls last'));
  }
  for (const col of restCols) {
    if (col !== querySort) {
      q.orderByRaw(sortCols[col]);
    }
  }
}

export function applyEntrySearchParams(q, query) {
  if ('headword' in query) {
    q.where('entry.headword', '~*', mungeRegex(query.headword));
  }

  if ('gloss' in query) {
    q
      .join('sense', 'sense.entry_id', 'entry.id')
      .join('sense_gloss', 'sense_gloss.sense_id', 'sense.id')
      .where('sense_gloss.txt', '~*', query.gloss);
  }

  if (query.set === 'linked') {
    q.join('set_member', 'set_member.entry_id', 'entry.id');
  } else if (query.set === 'unlinked') {
    q
      .leftJoin('set_member', 'set_member.entry_id', 'entry.id')
      .whereNull('set_member.set_id');
  }
}

export async function getCount(q) {
  const count = await q.clone().count({ count: '*' }).first();
  return Number(count.count);
}

export function sendPgError(e) {
  return { status: 400, body: { error: formatPgError(e) } };
}

function formatPgError(e) {
  switch (e.code) {
    case '23502': // not_null_violation
      return `"${e.column}" value cannot be empty`;
    case '23505': // unique_violation
      return 'value already exists elsewhere, must be unique';
    case 'P0001': // raise exception
      return 'tried to set parent language to descendant';
    default:
      return 'unknown error';
  }
}
