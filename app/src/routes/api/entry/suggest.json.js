import errors from '$lib/errors';
import { arrayCmp, getLanguageIds, knex, setIds } from '$lib/db';
import { ensureNfcParams, getFilteredParams, mungeRegex, normalizeQuery, parseArrayParams,
  parseBooleanParams } from '$lib/util';
import { requireAuth } from '$lib/auth';

const allowed = new Set(['id', 'lang', 'linked', 'max', 'match', 'search', 'set_id']);
const required = new Set(['match', 'search']);
const boolean = new Set(['linked']);
const arrayParams = new Set(['lang']);
const nfc = new Set(['search']);
const defaults = {
  linked: false,
  max: 100,
};

export const get = requireAuth(async ({ query }) => {
  query = getFilteredParams(normalizeQuery(query), allowed);
  if (Object.keys(getFilteredParams(query, required)).length !== required.size) {
    return { status: 400, body: { error: errors.missing } };
  }
  if (query.match !== 'headword' && query.match !== 'gloss') {
    return { status: 400, body: { error: 'match parameter must be "headword" or "gloss"' } };
  }
  parseBooleanParams(query, boolean);
  parseArrayParams(query, arrayParams);
  ensureNfcParams(query, nfc);
  const { linked, match, max, search } = { ...defaults, ...query };
  const mungedSearch = mungeRegex(search);

  const subq = knex('entry')
    .select('entry.id');

  if (match === 'headword') {
    subq.where('entry.headword', '~*', mungedSearch);
  } else {
    subq
      .join('sense', 'sense.entry_id', 'entry.id')
      .join('sense_gloss', 'sense_gloss.sense_id', 'sense.id')
      .where('sense_gloss.txt', '~*', mungedSearch)
      .groupBy('entry.id');
  }

  if (!linked) {
    subq.whereNotExists(function () {
      this.select('*').from('set_member')
        .where('set_member.entry_id', knex.ref('entry.id'));
    });
  } else if ('set_id' in query) {
    subq.whereNotExists(function () {
      this.select('*').from('set_member')
        .where('set_member.entry_id', knex.ref('entry.id'))
        .where('set_member.set_id', query.set_id);
    });
  }

  if ('id' in query) {
    subq.where('entry.id', '!=', query.id);
  }

  if ('lang' in query) {
    const lang = await getLanguageIds(query.lang);
    if (lang) {
      subq
        .join('source', 'source.id', 'entry.source_id')
        .where('source.language_id', arrayCmp(lang));
    }
  }

  const q = knex
    .from(subq.as('found'))
    .join('entry', 'entry.id', 'found.id')
    .join('entry_senses as es', 'es.id', 'found.id')
    .join('source', 'source.id', 'entry.source_id')
    .join('language', 'language.id', 'source.language_id')
    .select(
      'entry.id',
      'entry.headword',
      'es.senses',
      'language.name as language_name',
      'source.reference as source_reference'
    )
    .orderBy('language.name', 'entry.headword_degr', 'entry.headword', 'source.reference')
    .limit(max);
  if (linked) {
    q.select(knex.raw(`${setIds('entry.id')} as set_ids`));
  }

  try {
    return {
      body: {
        rows: await q,
      },
    };
  } catch (e) {
    console.log(e);
    return {
      body: {
        rows: [],
      },
    };
  }
});
