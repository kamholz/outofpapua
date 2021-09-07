import { applyPageParams, arrayCmp, filterGlosslang, filterPublicSources, getCountDistinct, knex } from '$lib/db';
import { defaultPreferences } from '$lib/preferences';
import { ensureNfcParams, getFilteredParams, normalizeQuery, parseArrayNumParams } from '$lib/util';
import { nfc } from './_params';

const allowed = new Set(['gloss', 'glosslang', 'lang1', 'lang2', 'page', 'pagesize']);
const arrayNumParams = new Set(['glosslang']);
const defaults = {
  page: 1,
  pagesize: defaultPreferences.listPageSize,
};

function makeQuery(q, query, lang, locals) {
  q = q
    .from('entry')
    .join('source', 'source.id', 'entry.source_id')
    .join('sense', 'sense.entry_id', 'entry.id')
    .join('sense_gloss', 'sense_gloss.sense_id', 'sense.id')
    .where('source.language_id', query[lang]);
  filterPublicSources(q, locals);

  if ('gloss' in query) {
    q.where('sense_gloss.txt', '~*', query.gloss);
  }

  if ('glosslang' in query) {
    q.where('sense_gloss.language_id', arrayCmp(new Set(query.glosslang)));
  }

  return q;
}

function makeCte(q, query, lang, locals) {
  makeQuery(q, query, lang, locals)
  .select(
    'entry.id',
    'sense_gloss.language_id',
    'sense_gloss.txt_degr'
  );
}

const compare_entries = `
  json_agg(
    json_build_object(
      'id', compare_entry.id,
      'headword', compare_entry.headword,
      'record_id', compare_entry.record_id,
      'origin', compare_entry.origin,
      'senses', compare_es.senses,
      'set_id', compare_set_member.set_id
    )
    ORDER BY compare_entry.headword
  ) FILTER (WHERE compare_entry.id IS NOT NULL)
`;

export async function get({ locals, query }) {
  query = getFilteredParams(normalizeQuery(query), allowed);
  if (!['lang1', 'lang2'].some((attr) => attr in query)) {
    return { status: 400, body: { error: 'insufficient search parameters' } };
  }
  parseArrayNumParams(query, arrayNumParams);
  ensureNfcParams(query, nfc);
  query = { ...defaults, ...query };

  const subq = knex
    .with('lang1', (cte) => makeCte(cte, query, 'lang1', locals))
    .with('lang2', (cte) => makeCte(cte, query, 'lang2', locals))
    .from('lang1')
    .leftJoin('lang2', function () {
      this.on('lang2.language_id', 'lang1.language_id').andOn('lang2.txt_degr', 'lang1.txt_degr');
    })
    .select('lang1.id as lang1_id', 'lang2.id as lang2_id')
    .distinct();

  const q = knex.from(subq.as('found'))
    .join('entry', 'entry.id', 'found.lang1_id')
    .join('entry_with_senses as es', 'es.id', 'entry.id')
    .leftJoin('entry as compare_entry', 'compare_entry.id', 'found.lang2_id')
    .leftJoin('entry_with_senses as compare_es', 'compare_es.id', 'compare_entry.id')
    .leftJoin('set_member', 'set_member.entry_id', 'entry.id')
    .leftJoin('set_member as compare_set_member', 'compare_set_member.entry_id', 'compare_entry.id')
    .groupBy(
      'entry.id',
      knex.raw('es.senses::jsonb'),
      'set_member.set_id'
    )
    .select(
      'entry.id',
      'entry.headword',
      'entry.origin',
      'entry.record_id',
      knex.raw('es.senses::jsonb'),
      'set_member.set_id',
      knex.raw(`${compare_entries} as compare_entries`)
    )
    .orderByRaw(`${compare_entries} IS NULL`)
    .orderByRaw('lower(entry.headword)');

  const rowCount = await getCountDistinct(makeQuery(knex, query, 'lang1', locals), 'entry.id');
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
