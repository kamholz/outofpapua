import knexModule from 'knex';
import config from '$config';

const knex = knexModule({
  client: 'pg',
  connection: {
    host:     config.PGHOST,
    database: config.PGDATABASE,
  }
});
export { knex as knex };

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
    q.offset((page-1) * pageSize);
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

export async function getCount(q) {
  const counts = await q.clone().count({ count: '*' });
  return Number(counts[0].count);
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