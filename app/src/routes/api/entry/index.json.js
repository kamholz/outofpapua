import errors from '$lib/errors';
import { applyEntrySearchParams, applyPageParams, applySortParams, arrayCmp, filterGlosslang, getCount,
  knex, sendPgError, transaction } from '$lib/db';
import { defaultPreferences } from '$lib/preferences';
import { ensureNfcParams, getFilteredParams, normalizeQuery, parseArrayNumParams, parseArrayParams,
  parseBooleanParams, partitionPlus } from '$lib/util';
import { nfc, table } from './_params';
import { requireAuth } from '$lib/auth';

const allowed = new Set(['asc', 'headword', 'gloss', 'glosslang', 'lang', 'langcat', 'origin', 'page', 'pagesize',
  'set', 'sort']);
const boolean = new Set(['asc']);
const arrayParams = new Set(['lang']);
const arrayNumParams = new Set(['glosslang']);
const defaults = {
  asc: true,
  origin: 'all',
  page: 1,
  pagesize: defaultPreferences.tablePageSize,
  sort: 'headword',
  langcat: 'lang',
  set: 'both',
};
const sortCols = {
  language: 'language.name',
  source: 'source.reference',
  headword: 'lower(entry.headword)',
  senses: "lower(entry.senses -> 0 -> 'glosses' -> 0 ->> 'txt')",
};

export async function get({ query }) {
  query = getFilteredParams(normalizeQuery(query), allowed);
  if (!['headword', 'gloss'].some((attr) => attr in query)) {
    return { status: 400, body: { error: 'insufficient search parameters' } };
  }
  parseBooleanParams(query, boolean);
  parseArrayParams(query, arrayParams);
  parseArrayNumParams(query, arrayNumParams);
  ensureNfcParams(query, nfc);
  query = { ...defaults, ...query };

  const subq = knex(table)
    .select('entry.id')
    .distinct();

  let joinedSource = false;
  function joinSource() {
    if (!joinedSource) {
      subq.join('source', 'source.id', 'entry.source_id');
      joinedSource = true;
    }
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
    const [lang, langPlus] = partitionPlus(query.lang);
    if (langPlus.length) {
      const descendants = await knex('language_with_descendants')
        .where('id', arrayCmp(new Set(langPlus)))
        .pluck('descendants');
      for (const d of descendants) {
        lang.push(...d);
      }
    }
    if (lang.length) {
      joinSource();
      subq.where('source.language_id', arrayCmp(new Set(lang)));
    }
  }

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
    'language.id as language_id',
    'language.name as language',
    'source.id as source_id',
    'source.reference as source',
    'source.editable as source_editable',
    'set_member.set_id'
  );

  const pageCount = applyPageParams(q, query, rowCount);
  applySortParams(q, query, sortCols, ['language', 'headword']);

  const rows = await q;
  filterGlosslang(query, rows);

  return {
    body: {
      query,
      pageCount,
      rowCount,
      rows,
    },
  };
}

const allowedCreate = new Set(['headword', 'headword_normalized', 'note', 'origin', 'origin_language_id',
  'root', 'source_id']);
const requiredCreate = new Set(['headword', 'source_id']);

export const post = requireAuth(async ({ body, locals }) => {
  const params = getFilteredParams(body, allowedCreate);
  if (Object.keys(getFilteredParams(params, requiredCreate)).length !== requiredCreate.size) {
    return { status: 400, body: { error: errors.missing } };
  }
  if (params.origin_language_id && params.origin !== 'borrowed') {
    return { status: 400, body: { error: errors.originLang } };
  }
  ensureNfcParams(params, nfc);
  try {
    const source = await knex('source')
      .where('id', params.source_id)
      .whereRaw('editable')
      .first('id');
    if (!source) {
      return { status: 400, body: { error: 'source does not exist or is not editable' } };
    }

    const ids = await transaction(locals, (trx) =>
      trx(table)
      .returning('id')
      .insert(params)
    );
    return { body: { id: ids[0] } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
