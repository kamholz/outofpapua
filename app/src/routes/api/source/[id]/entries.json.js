import config from '$config';
import { applyPageParams, applySortParams, getCount, knex } from '$lib/db';
import { getFilteredParams, normalizeQuery, parseBooleanParams } from '$lib/util';

const allowed = new Set(['page', 'pagesize', 'sort', 'asc']);
const boolean = new Set(['asc']);
const defaults = {
  asc: true,
  page: 1,
  pagesize: Number(config.PAGESIZE),
  sort: 'headword',
};
const sortCols = {
  headword: 'lower(entry.headword)',
  senses: "lower(entry.senses -> 0 -> 'glosses' -> 0 ->> 'txt')",
};

export async function get({ params, query }) {
  query = getFilteredParams(normalizeQuery(query), allowed);
  parseBooleanParams(query, boolean);
  query = { ...defaults, ...query };

  const q = knex('entry_with_senses as entry')
    .join('source', 'source.id', 'entry.source_id')
    .where('source.id', Number(params.id));

  const rowCount = await getCount(q);

  q.select(
    'entry.id',
    'entry.headword',
    'entry.senses',
    'entry.record_id'
  );

  const pageCount = applyPageParams(q, query, rowCount);
  applySortParams(q, query, sortCols, ['headword', 'senses']);

  return {
    body: {
      query,
      pageCount,
      rowCount,
      rows: await q,
    },
  };
}
