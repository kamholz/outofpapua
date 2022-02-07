import errors from '$lib/errors';
import { applyEntrySearchParams, applyPageParams, applySortParams, arrayCmp, filterGlosslang, getCount, getLanguageIds,
  knex, sendPgError, setIds } from '$lib/db';
import { defaultPreferences } from '$lib/preferences';
import { ensureNfcParams, getFilteredParams, hideComparativeInEntry, mungeHeadword, mungeRegex, normalizeQuery,
  parseArrayNumParams, parseArrayParams, parseBooleanParams, showPublicOnly } from '$lib/util';
import { nfc } from './_params';
import { requireAuth } from '$lib/auth';

const allowedHideComparative = new Set(['asc', 'gloss', 'headword', 'headword_exact', 'headword_ipa',
  'headword_ipa_exact', 'lang', 'langcat', 'page', 'pagesize', 'record', 'sort']);
const allowed = new Set([...allowedHideComparative, 'borrowlang', 'glosslang', 'origin', 'set']);
const boolean = new Set(['asc', 'headword_exact', 'headword_ipa_exact']);
const arrayParams = new Set(['lang']);
const arrayNumParams = new Set(['borrowlang', 'glosslang']);
const defaults = {
  asc: true,
  origin: 'all',
  page: 1,
  pagesize: defaultPreferences.tablePageSize,
  sort: 'language',
  langcat: 'lang',
  set: 'both',
};
const sortCols = {
  language: 'language.name',
  source: 'source.reference',
  headword: ['entry.headword_degr', 'entry.headword'],
  headword_ipa: 'entry.headword_ipa',
  senses: "lower(entry.senses -> 0 -> 'glosses' -> 0 ->> 'txt')",
};

export async function get({ locals, url: { searchParams } }) {
  let query = getFilteredParams(normalizeQuery(searchParams),
    locals.hideComparative ? allowedHideComparative : allowed);
  if (!['borrowlang', 'gloss', 'headword', 'headword_ipa', 'record'].some((attr) => attr in query)) {
    return { status: 400, body: { error: errors.insufficientSearch } };
  }
  parseBooleanParams(query, boolean);
  parseArrayParams(query, arrayParams);
  parseArrayNumParams(query, arrayNumParams);
  ensureNfcParams(query, nfc);
  query = { ...defaults, ...query };

  const subq = knex('entry')
    .select('entry.id')
    .distinct();

  let joinedSource = false;
  function joinSource() {
    if (!joinedSource) {
      subq.join('source', 'source.id', 'entry.source_id');
      joinedSource = true;
    }
  }

  if (showPublicOnly(locals)) {
    joinSource();
    subq.whereRaw('source.public');
  }

  applyEntrySearchParams(subq, query);

  if (query.langcat === 'lang') {
    joinSource();
    subq.whereNotExists(function () {
      this.select('*').from('protolanguage').where('protolanguage.id', knex.ref('source.language_id'));
    });
  } else if (query.langcat === 'proto') {
    joinSource();
    subq.whereExists(function () {
      this.select('*').from('protolanguage').where('protolanguage.id', knex.ref('source.language_id'));
    });
  }

  if ('lang' in query) {
    const lang = await getLanguageIds(query.lang);
    if (lang) {
      joinSource();
      subq.where('source.language_id', arrayCmp(lang));
    }
  }

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
    'language.id as language_id',
    'language.name as language_name',
    'source.id as source_id',
    'source.reference as source_reference',
    'source.editable as source_editable',
    knex.raw(`${setIds('entry.id')} as set_ids`)
  );

  if ('record' in query) {
    q
      .join('record', 'record.id', 'entry.record_id')
      .select(
        'source.formatting as source_formatting',
        'record.data as record_data',
        knex.raw("array(select distinct (regexp_matches(record_text(record.data), ?, 'g'))[1]) as record_match",
          `(${mungeRegex(query.record)})`)
      );
  }

  const pageCount = applyPageParams(q, query, rowCount);
  applySortParams(q, query, sortCols, ['language', 'headword']);

  const rows = await q;
  filterGlosslang(query, rows);
  if (locals.hideComparative) {
    for (const row of rows) {
      hideComparativeInEntry(row);
    }
  }

  return {
    body: {
      query,
      pageCount,
      rowCount,
      rows,
    },
  };
}

const allowedCreate = new Set(['headword', 'headword_ipa', 'origin', 'origin_language_id', 'root', 'source_id']);
const requiredCreate = new Set(['headword', 'source_id']);

export const post = requireAuth(async ({ request }) => {
  const params = getFilteredParams(await request.json(), allowedCreate);
  if (Object.keys(getFilteredParams(params, requiredCreate)).length !== requiredCreate.size) {
    return { status: 400, body: { error: errors.missing } };
  }
  if (params.origin_language_id && params.origin !== 'borrowed') {
    return { status: 400, body: { error: errors.originLang } };
  }
  ensureNfcParams(params, nfc);
  try {
    const source = await knex('source')
      .leftJoin('protolanguage', 'protolanguage.id', 'source.language_id')
      .where('id', params.source_id)
      .whereRaw('editable')
      .first('id', 'protolanguage.id as proto');
    if (!source) {
      return { status: 400, body: { error: 'source does not exist or is not editable' } };
    }

    params.headword = mungeHeadword(params.headword, Boolean(source.proto));
    const ids = await knex.transaction((trx) =>
      trx('entry')
      .returning('id')
      .insert(params)
    );
    return { body: { id: ids[0] } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
