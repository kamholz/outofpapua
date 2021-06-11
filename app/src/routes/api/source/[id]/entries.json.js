import { applyEntrySearchParams, applyPageParams, applySortParams, getCount, knex } from '$lib/db';
import { defaultPreferences } from '$lib/preferences';
import { getFilteredParams, normalizeQuery, parseBooleanParams } from '$lib/util';

const allowed = new Set(['asc', 'gloss', 'headword', 'page', 'pagesize', 'set', 'sort']);
const boolean = new Set(['asc']);
const defaults = {
  asc: true,
  page: 1,
  pagesize: defaultPreferences.pageSize,
  sort: 'headword',
  set: 'both',
};
const sortCols = {
  headword: 'lower(entry.headword)',
  senses: "lower(entry.senses -> 0 -> 'glosses' -> 0 ->> 'txt')",
};

export async function get({ params, query }) {
  query = getFilteredParams(normalizeQuery(query), allowed);
  parseBooleanParams(query, boolean);
  query = { ...defaults, ...query };

  const subq = knex('entry')
    .select('entry.id')
    .where('entry.source_id', Number(params.id))
    .distinct();

  applyEntrySearchParams(subq, query);

  const q = knex
    .from(subq.as('found'))
    .join('entry_with_senses as entry', 'entry.id', 'found.id')
    .join('source', 'source.id', 'entry.source_id')
    .join('language', 'language.id', 'source.language_id')
    .leftJoin('set_member', 'set_member.entry_id', 'entry.id');

  const rowCount = await getCount(q);

  q.select(
    'entry.id',
    'entry.headword',
    'entry.senses',
    'entry.record_id',
    'set_member.set_id'
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
