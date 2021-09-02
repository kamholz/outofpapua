import { applyEntrySearchParams, applyPageParams, applySortParams, getCount, knex } from '$lib/db';
import { defaultPreferences } from '$lib/preferences';
import { ensureNfcParams, getFilteredParams, normalizeQuery, parseBooleanParams, showPublicOnly,
  validateParams } from '$lib/util';

const allowed = new Set(['asc', 'gloss', 'headword', 'origin', 'page', 'pagesize', 'set', 'sort']);
const boolean = new Set(['asc']);
const nfc = new Set(['gloss', 'headword']);
const defaults = {
  asc: true,
  origin: 'all',
  page: 1,
  pagesize: defaultPreferences.tablePageSize,
  sort: 'headword',
  set: 'both',
};
const sortCols = {
  headword: 'lower(entry.headword)',
  senses: "lower(entry.senses -> 0 -> 'glosses' -> 0 ->> 'txt')",
};

export const get = validateParams(async ({ locals, params, query }) => {
  query = getFilteredParams(normalizeQuery(query), allowed);
  parseBooleanParams(query, boolean);
  ensureNfcParams(query, nfc);
  query = { ...defaults, ...query };
  const { id } = params;

  if (showPublicOnly(locals)) {
    const row = await knex('source')
      .where('id', id)
      .whereRaw('public')
      .first('id');
    if (!row) {
      return;
    }
  }

  const subq = knex('entry')
    .select('entry.id')
    .where('entry.source_id', id)
    .distinct();

  applyEntrySearchParams(subq, query);

  const q = knex
    .from(subq.as('found'))
    .join('entry_with_senses as entry', 'entry.id', 'found.id')
    .join('source', 'source.id', 'entry.source_id')
    .join('language', 'language.id', 'source.language_id')
    .leftJoin('set_member', 'set_member.entry_id', 'entry.id')
    .leftJoin('language as origin_language', 'origin_language.id', 'entry.origin_language_id');

  const rowCount = await getCount(q);

  q.select(
    'entry.id',
    'entry.headword',
    'entry.origin',
    'entry.origin_language_id',
    'origin_language.name as origin_language_name',
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
});
