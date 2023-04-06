import errors from '$lib/errors';
import { applyPageParams, applySortParams, arrayCmp, getCount, getLanguageIds, knex } from '$lib/db';
import { defaultPreferences } from '$lib/preferences';
import { getFilteredParams, jsonError, mungeRegex, normalizeQuery, parseArrayNumParams, parseArrayParams,
  parseBooleanParams, showPublicOnly } from '$lib/util';
import { json } from '@sveltejs/kit';

const record_match = `array(
  select distinct lower((regexp_matches(record_row.value, ?, 'gi'))[1])
  from record_row
  where record_row.id = record.id
) as record_match`;

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

  const q = knex('record')
    .join('record_source as rs', 'rs.id', 'record.id')
    .join('source', 'source.id', 'rs.source_id')
    .join('language', 'language.id', 'source.language_id');

  if (showPublicOnly(locals)) {
    q.whereRaw('source.public');
  }

  if ('record' in query || 'record_marker' in query) {
    q.whereExists(function () {
      this.select('*').from('record_row').where('record_row.id', knex.ref('record.id'));
      if ('record_marker' in query) {
        this.where('record_row.marker', query.record_marker);
      }
      if ('record' in query) {
        this.where('record_row.value', '~*', mungeRegex(query.record));
      }
    });
  }

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
    'record.id',
    'record.data as record_data',
    'source.reference as source_reference',
    'source.formatting as source_formatting',
    'language.name as language_name'
  );

  if ('record' in query) {
    q.select(knex.raw(record_match, `(${mungeRegex(query.record)})`));
  }

  const pageCount = applyPageParams(q, query, rowCount);
  applySortParams(q, query, sortCols, ['language', 'source']);

  console.log(q.toString());
  return json({
    query,
    pageCount,
    rowCount,
    rows: await q,
  });
}
