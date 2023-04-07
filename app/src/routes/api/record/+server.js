import errors from '$lib/errors';
import { applyPageParams, applySortParams, arrayCmp, getCount, getLanguageIds, knex, record_match,
  setIds } from '$lib/db';
import { defaultPreferences } from '$lib/preferences';
import { getFilteredParams, jsonError, mungeRegex, normalizeQuery, parseArrayNumParams, parseArrayParams,
  parseBooleanParams, showPublicOnly } from '$lib/util';
import { json } from '@sveltejs/kit';

const allowed = new Set(['asc', 'lang', 'langcat', 'page', 'pagesize', 'record', 'record_marker', 'region', 'sort',
  'source']);
const boolean = new Set(['asc']);
const arrayParams = new Set(['lang']);
const arrayNumParams = new Set(['source']);
const defaults = {
  asc: true,
  page: 1,
  pagesize: defaultPreferences.tablePageSize,
  sort: 'language',
  langcat: 'lang',
};
const sortCols = {
  language: 'language.name',
  source: 'source.reference',
  headword: ['entry.headword_degr', 'entry.headword'],
  headword_ipa: 'entry.headword_ipa',
};

export async function GET({ locals, url: { searchParams } }) {
  let query = getFilteredParams(normalizeQuery(searchParams), allowed);
  if (!['record', 'record_marker'].some((attr) => attr in query)) {
    return jsonError(errors.insufficientSearch);
  }
  parseBooleanParams(query, boolean);
  parseArrayParams(query, arrayParams);
  parseArrayNumParams(query, arrayNumParams);
  query = { ...defaults, ...query };

  const q = knex('entry')
    .join('record', 'record.id', 'entry.record_id')
    .join('source', 'source.id', 'entry.source_id')
    .join('language', 'language.id', 'source.language_id')
    .leftJoin('language as origin_language', 'origin_language.id', 'entry.origin_language_id');

  if (showPublicOnly(locals)) {
    q.whereRaw('source.public');
  }

  q.whereExists(function () {
    this.select('*').from('record_row').where('record_row.id', knex.ref('record.id'));
    if ('record_marker' in query) {
      this.where('record_row.marker', query.record_marker);
    }
    if ('record' in query) {
      this.where('record_row.value', '~*', mungeRegex(query.record));
    }
  });

  if (query.langcat === 'lang') {
    q.whereNotExists(function () {
      this.select('*').from('protolanguage').where('protolanguage.id', knex.ref('source.language_id'));
    });
  } else if (query.langcat === 'proto') {
    q.whereExists(function () {
      this.select('*').from('protolanguage').where('protolanguage.id', knex.ref('source.language_id'));
    });
  }

  if ('source' in query) {
    q.where('rs.source_id', arrayCmp(query.source));
  }

  if ('lang' in query) {
    const lang = await getLanguageIds(query.lang);
    if (lang) {
      q.where('source.language_id', arrayCmp(lang));
    }
  }

  if ('region' in query) {
    q.whereIn('source.language_id', function () {
      this.select('id').from('language').where('region', query.region);
    });
  }

  const rowCount = await getCount(q);

  q.select(
    'entry.id',
    'entry.headword',
    'entry.headword_ipa',
    'entry.origin',
    'entry.origin_language_id',
    'origin_language.name as origin_language_name',
    'entry.record_id',
    'record.data as record_data',
    'language.id as language_id',
    'language.name as language_name',
    'source.reference as source_reference',
    'source.editable as source_editable',
    'source.formatting as source_formatting',
    knex.raw(`${setIds('entry.id')} as set_ids`),
  );

  if ('record' in query) {
    q.select(knex.raw(record_match, `(${mungeRegex(query.record)})`));
  }

  const pageCount = applyPageParams(q, query, rowCount);
  applySortParams(q, query, sortCols, ['language', 'headword']);

  console.log(q.toString());
  const rows = await q;

  const seenRecord = new Set();
  for (const row of rows) {
    if (seenRecord.has(row.record_id)) {
      row.seen_record = true;
    } else {
      row.seen_record = false;
      seenRecord.add(row.record_id);
    }
  }

  return json({
    query,
    pageCount,
    rowCount,
    rows,
  });
}
