import errors from '$lib/errors';
import { applyPageParams, arrayCmp, filterGlosslang, filterPublicSources, getCountDistinct, getLanguageIds,
  knex } from '$lib/db';
import { defaultPreferences } from '$lib/preferences';
import { ensureNfcParams, getFilteredParams, normalizeQuery, parseArrayNumParams, parseArrayParams } from '$lib/util';
import { nfc } from './_params';

const allowed = new Set(['gloss', 'glosslang', 'lang1', 'lang2', 'page', 'pagesize']);
const arrayNumParams = new Set(['glosslang']);
const arrayParams = new Set(['lang1', 'lang2']);
const defaults = {
  page: 1,
  pagesize: defaultPreferences.listPageSize,
};

function makeQuery(q, { lang, locals, query }) {
  q = q
    .from('entry')
    .join('source', 'source.id', 'entry.source_id')
    .join('sense', 'sense.entry_id', 'entry.id')
    .join('sense_gloss', 'sense_gloss.sense_id', 'sense.id')
    .where('source.language_id', arrayCmp(lang));
  filterPublicSources(q, locals);

  if ('gloss' in query) {
    q.where('sense_gloss.txt', '~*', query.gloss);
  }

  if ('glosslang' in query) {
    q.where('sense_gloss.language_id', arrayCmp(new Set(query.glosslang)));
  }

  return q;
}

function makeCte(q, obj) {
  makeQuery(q, obj)
  .select(
    'entry.id',
    'sense_gloss.language_id',
    'sense_gloss.txt_degr'
  );
}

const compare_entries1 = `
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

const compare_entries2 = `
  json_agg(
    json_build_object(
      'language_id', found_with_compare.compare_language_id,
      'language_name', compare_language.name,
      'entries', found_with_compare.compare_entries
    )
    ORDER BY compare_language.name
  ) FILTER (WHERE found_with_compare.compare_language_id IS NOT NULL)
`;

export async function get({ locals, query }) {
  query = getFilteredParams(normalizeQuery(query), allowed);
  if (!['lang1', 'lang2'].some((attr) => attr in query)) {
    return { status: 400, body: { error: errors.insufficientSearch } };
  }
  parseArrayParams(query, arrayParams);
  parseArrayNumParams(query, arrayNumParams);
  ensureNfcParams(query, nfc);
  query = { ...defaults, ...query };

  const lang1 = await getLanguageIds(query.lang1);
  const lang2 = await getLanguageIds(query.lang2);
  if (!lang1 || !lang2) {
    return { status: 500 };
  }
  if (lang1.some((a) => lang2.some((b) => a === b))) {
    return { status: 400, body: { error: 'languages 1 and 2 overlap', query } };
  }

  const subq = knex
    .with('lang1', (cte) => makeCte(cte, { lang: lang1, locals, query }))
    .with('lang2', (cte) => makeCte(cte, { lang: lang2, locals, query }))
    .from('lang1')
    .leftJoin('lang2', function () {
      this.on('lang2.language_id', 'lang1.language_id').andOn('lang2.txt_degr', 'lang1.txt_degr');
    })
    .select('lang1.id as lang1_id', 'lang2.id as lang2_id')
    .distinct();

  const q = knex.from(
    knex.from(subq.as('found'))
    .join('entry', 'entry.id', 'found.lang1_id')
    .leftJoin('entry as compare_entry', 'compare_entry.id', 'found.lang2_id')
    .leftJoin('entry_with_senses as compare_es', 'compare_es.id', 'compare_entry.id')
    .leftJoin('set_member as compare_set_member', 'compare_set_member.entry_id', 'compare_entry.id')
    .leftJoin('source as compare_source', 'compare_source.id', 'compare_entry.source_id')
    .select(
      'found.lang1_id as entry_id',
      'compare_source.language_id AS compare_language_id',
      knex.raw(`${compare_entries1} AS compare_entries`)
    )
    .groupBy(
      'found.lang1_id',
      'compare_source.language_id'
    )
    .as('found_with_compare')
  )
  .join('entry', 'entry.id', 'found_with_compare.entry_id')
  .join('entry_with_senses as es', 'es.id', 'entry.id')
  .join('source', 'source.id', 'entry.source_id')
  .leftJoin('set_member', 'set_member.entry_id', 'entry.id')
  .leftJoin('language as compare_language', 'compare_language.id', 'found_with_compare.compare_language_id')
  .select(
    'entry.id',
    'entry.headword',
    'entry.headword_degr',
    'entry.origin',
    'entry.record_id',
    knex.raw('es.senses::jsonb'),
    'source.language_id',
    'set_member.set_id',
    knex.raw(`${compare_entries2} as compare_entries`)
  )
  .groupBy(
    'entry.id',
    knex.raw('es.senses::jsonb'),
    'source.language_id',
    'set_member.set_id'
  )
  .orderByRaw(`${compare_entries2} IS NULL`)
  .orderByRaw('entry.headword_degr')
  .orderByRaw('entry.headword');

  const rowCount = await getCountDistinct(makeQuery(knex, { lang: lang1, locals, query }), 'entry.id');
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
