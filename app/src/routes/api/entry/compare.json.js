import { applyPageParams, arrayCmp, filterGlosslang, getCount, knex } from '$lib/db';
import { defaultPreferences } from '$lib/preferences';
import { ensureNfcParams, getFilteredParams, normalizeQuery, parseArrayNumParams,
  parseBooleanParams } from '$lib/util';
import { nfc } from './_params';

const allowed = new Set(['asc', 'gloss', 'glosslang', 'lang1', 'lang2', 'page', 'pagesize', 'sort']);
const boolean = new Set(['asc']);
const arrayNumParams = new Set(['glosslang']);
const defaults = {
  asc: true,
  page: 1,
  pagesize: defaultPreferences.tablePageSize,
};

function makeQuery(q, query, lang) {
  q = q
    .from('entry')
    .join('source', 'source.id', 'entry.source_id')
    .join('sense', 'sense.entry_id', 'entry.id')
    .join('sense_gloss', 'sense_gloss.sense_id', 'sense.id')
    .where('source.language_id', query[lang]);

  if ('gloss' in query) {
    q.where('sense_gloss.txt', '~*', query.gloss);
  }

  if ('glosslang' in query) {
    q.where('sense_gloss.language_id', arrayCmp(new Set(query.glosslang)));
  }

  return q;
}

function makeCte(q, query, lang) {
  makeQuery(q, query, lang)
  .select(
    'entry.id',
    'sense_gloss.language_id',
    'sense_gloss.txt'
  );
}

const compare_entries = `
  json_agg(
    json_build_object(
      'headword', entry2.headword, 
      'senses', entry2.senses
    )
    ORDER BY entry2.headword
  ) FILTER (WHERE entry2.id IS NOT NULL)
`;

export async function get({ query }) {
  query = getFilteredParams(normalizeQuery(query), allowed);
  if (!['lang1', 'lang2'].some((attr) => attr in query)) {
    return { status: 400, body: { error: 'insufficient search parameters' } };
  }
  parseBooleanParams(query, boolean);
  parseArrayNumParams(query, arrayNumParams);
  ensureNfcParams(query, nfc);
  query = { ...defaults, ...query };

  const subq = knex
    .with('lang1', (cte) => makeCte(cte, query, 'lang1'))
    .with('lang2', (cte) => makeCte(cte, query, 'lang2'))
    .from('lang1')
    .leftJoin('lang2', function () {
      this.on('lang2.language_id', 'lang1.language_id').andOn('lang2.txt', 'lang1.txt');
    })
    .select('lang1.id as lang1_id', 'lang2.id as lang2_id')
    .distinct();

  const q = knex.from(subq.as('found'))
    .join('entry_with_senses as entry1', 'entry1.id', 'found.lang1_id')
    .leftJoin('entry_with_senses as entry2', 'entry2.id', 'found.lang2_id')
    .groupBy('entry1.id', 'entry1.headword', knex.raw('entry1.senses::jsonb'))
    .select(
      'entry1.id',
      'entry1.headword',
      knex.raw('entry1.senses::jsonb'),
      knex.raw(`${compare_entries} as compare_entries`)
    )
    .orderByRaw(`${compare_entries} IS NULL`)
    .orderByRaw('lower(entry1.headword)');

  const rowCount = await getCount(makeQuery(knex, query, 'lang1'));
  const pageCount = applyPageParams(q, query, rowCount);

  const rows = await q;
  filterGlosslang(query, rows, true);

  return {
    body: {
      query,
      pageCount,
      rowCount,
      rows,
    },
  };
}
