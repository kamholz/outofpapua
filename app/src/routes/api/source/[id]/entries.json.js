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
  pos: 'lower(entry.pos)',
  gloss: 'lower(sense_gloss.txt)',
  gloss_language: 'language.name',
};

export async function get({ params, query }) {
  query = getFilteredParams(normalizeQuery(query), allowed);
  parseBooleanParams(query, boolean);
  query = { ...defaults, ...query };

  const q = knex('entry')
    .join('source', 'source.id', 'entry.source_id')
    .join('sense', 'sense.entry_id', 'entry.id')
    .join('sense_gloss', 'sense_gloss.sense_id', 'sense.id')
    .join('language', 'language.id', 'sense_gloss.language_id')
    .where('source.id', Number(params.id));

  const rowCount = await getCount(q);

  q.select(
    'entry.headword',
    'entry.pos',
    'entry.record_id',
    'sense_gloss.txt as gloss',
    'language.name as gloss_language',
    knex.raw("(sense.id || '|' || sense_gloss.language_id || '|' || sense_gloss.txt) as id")
  );

  const pageCount = applyPageParams(q, query, rowCount);
  applySortParams(q, query, sortCols, ['headword', 'pos', 'gloss', 'gloss_language']);

  return {
    body: {
      query,
      pageCount,
      rowCount,
      rows: await q,
    },
  };
}
