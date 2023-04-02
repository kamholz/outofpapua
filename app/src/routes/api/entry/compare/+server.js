import errors from '$lib/errors';
import { applyPageParams, arrayCmp, filterGlosslang, filterPublicSources, getCountDistinct, getLanguageIds,
  knex, setIds } from '$lib/db';
import { defaultPreferences } from '$lib/preferences';
import { ensureNfcParams, getFilteredParams, hideComparativeInEntry, jsonError, normalizeQuery, parseArrayNumParams,
  parseArrayParams, parseBooleanParams } from '$lib/util';
import { error, json } from '@sveltejs/kit';
import { nfc } from '../params';
import { requireAuth } from '$lib/auth';

const allowed = new Set(['fuzzy', 'gloss', 'glosslang', 'lang1', 'lang2', 'page', 'pagesize']);
const arrayNumParams = new Set(['glosslang']);
const arrayParams = new Set(['lang1', 'lang2']);
const booleanParams = new Set(['fuzzy']);
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
      'origin_language_id', compare_entry.origin_language_id,
      'senses', compare_entry.senses,
      'set_ids', ${setIds('compare_entry.id')}
    )
    ORDER BY compare_entry.headword, compare_entry.id
  ) FILTER (WHERE compare_entry.id IS NOT NULL)
`;

const compare_entries2 = `
  json_agg(
    json_build_object(
      'language_id', found_with_compare.compare_language_id,
      'language_name', compare_language.name,
      'entries', found_with_compare.compare_entries
    )
    ORDER BY lower(compare_language.name)
  ) FILTER (WHERE found_with_compare.compare_language_id IS NOT NULL)
`;

export const GET = requireAuth(async ({ locals, url: { searchParams } }) => {
  let query = getFilteredParams(normalizeQuery(searchParams), allowed);
  if (!['lang1', 'lang2'].some((attr) => attr in query)) {
    return jsonError(errors.insufficientSearch);
  }
  parseArrayParams(query, arrayParams);
  parseArrayNumParams(query, arrayNumParams);
  parseBooleanParams(query, booleanParams);
  ensureNfcParams(query, nfc);
  query = { ...defaults, ...query };

  if (query.fuzzy && (!('gloss' in query) || query.gloss.match(/^\s*$/))) {
    throw error(500);
  }

  const lang1 = await getLanguageIds(query.lang1);
  const lang2 = await getLanguageIds(query.lang2);
  if (!lang1 || !lang2) {
    throw error(500);
  }
  if (hasOverlap(lang1, lang2)) {
    return jsonError('languages 1 and 2 overlap', query);
  }

  const subq = knex
    .with('lang1', (cte) => makeCte(cte, { lang: lang1, locals, query }))
    .with('lang2', (cte) => makeCte(cte, { lang: lang2, locals, query }))
    .from('lang1')
    .leftJoin('lang2', function () {
      this.on('lang2.language_id', 'lang1.language_id');
      if (query.fuzzy) {
        this.on('lang2.txt_degr', knex.raw('operator(pgtrgm.%)'), 'lang1.txt_degr');
      } else {
        this.on('lang2.txt_degr', 'lang1.txt_degr');
      }
    })
    .select('lang1.id as lang1_id', 'lang2.id as lang2_id')
    .distinct();

  const q = knex.from(
    knex.from(subq.as('found'))
    .join('entry', 'entry.id', 'found.lang1_id')
    .leftJoin('entry as compare_entry', 'compare_entry.id', 'found.lang2_id')
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
  .join('source', 'source.id', 'entry.source_id')
  .leftJoin('language as compare_language', 'compare_language.id', 'found_with_compare.compare_language_id')
  .select(
    'entry.id',
    'entry.headword',
    'entry.headword_degr',
    'entry.origin',
    'entry.origin_language_id',
    'entry.record_id',
    'entry.senses',
    'source.language_id',
    knex.raw(`${setIds('entry.id')} as set_ids`),
    knex.raw(`${compare_entries2} as compare_entries`)
  )
  .groupBy(
    'entry.id',
    'source.language_id'
  )
  .orderByRaw(`${compare_entries2} IS NULL`)
  .orderByRaw('entry.headword_degr')
  .orderByRaw('entry.headword');

  const rowCount = await getCountDistinct(makeQuery(knex, { lang: lang1, locals, query }), 'entry.id');
  const pageCount = applyPageParams(q, query, rowCount);

  const rows = await q;
  filterGlosslang(query, rows, true);
  if (locals.hideComparative) {
    for (const row of rows) {
      hideComparativeInEntry(row);
      if (row.compare_entries) {
        for (const language of row.compare_entries) {
          for (const entry of language.entries) {
            hideComparativeInEntry(entry);
          }
        }
      }
    }
  }

  return json({
    query,
    pageCount,
    rowCount,
    rows,
  });
});

function hasOverlap(lang1, lang2) {
  const lang2Set = new Set(lang2);
  return lang1.some((v) => lang2Set.has(v));
}
