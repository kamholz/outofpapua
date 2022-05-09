import { applyEntrySearchParams, applyPageParams, applySortParams, getCount, knex, setIds } from '$lib/db';
import { defaultPreferences } from '$lib/preferences';
import { ensureNfcParams, getFilteredParams, mungeRegex, normalizeQuery, parseArrayNumParams, parseBooleanParams,
  showPublicOnly } from '$lib/util';

const allowedHideComparative = new Set(['asc', 'gloss', 'headword', 'headword_exact', 'headword_ipa',
  'headword_ipa_exact', 'page', 'pagesize', 'record', 'sort']);
const allowed = new Set([...allowedHideComparative, 'borrowlang', 'origin', 'set']);
const boolean = new Set(['asc', 'headword_exact', 'headword_ipa_exact']);
const arrayNumParams = new Set(['borrowlang']);
const nfc = new Set(['gloss', 'headword', 'headword_ipa']);
const defaults = {
  asc: true,
  origin: 'all',
  page: 1,
  pagesize: defaultPreferences.tablePageSize,
  sort: 'headword',
  set: 'both',
};
const sortCols = {
  headword: ['entry.headword_degr', 'entry.headword'],
  headword_ipa: 'entry.headword_ipa',
  senses: "lower(entry.senses -> 0 -> 'glosses' -> 0 ->> 'txt')",
};

export async function get({ locals, params, url: { searchParams } }) {
  let query = getFilteredParams(normalizeQuery(searchParams),
    locals.hideComparative ? allowedHideComparative : allowed);
  parseBooleanParams(query, boolean);
  parseArrayNumParams(query, arrayNumParams);
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
    .join('entry', 'entry.id', 'found.id')
    .join('source', 'source.id', 'entry.source_id')
    .join('language', 'language.id', 'source.language_id')
    .leftJoin('language as origin_language', 'origin_language.id', 'entry.origin_language_id');

  const rowCount = await getCount(q);

  q.select(
    'entry.id',
    'entry.headword',
    'entry.headword_ipa',
    'entry.origin',
    'entry.origin_language_id',
    'origin_language.name as origin_language_name',
    'entry.senses',
    'entry.record_id',
    knex.raw(`${setIds('entry.id')} as set_ids`)
  );

  if ('record' in query) {
    q
      .join('record', 'record.id', 'entry.record_id')
      .select(
        'record.data as record_data',
        knex.raw("array(select distinct (regexp_matches(record_text(record.data), ?, 'g'))[1]) as record_match",
          `(${mungeRegex(query.record)})`)
      );
  }

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
