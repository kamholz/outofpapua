import errors from '$lib/errors';
import { arrayCmp, knex } from '$lib/db';
import { ensureNfcParams, getFilteredParams, mungeRegex, normalizeQuery, parseArrayParams,
  parseBooleanParams, partitionPlus } from '$lib/util';
import { requireAuth } from '$lib/auth';
import { table } from './_params';

const allowed = new Set(['lang', 'max', 'match', 'noset', 'search']);
const required = new Set(['match', 'search']);
const boolean = new Set(['noset']);
const arrayParams = new Set(['lang']);
const nfc = new Set(['search']);
const defaults = {
  max: 100,
  noset: true,
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
  const { match, max, noset, search } = { ...defaults, ...query };
  const mungedSearch = mungeRegex(search);

  const subq = knex(table)
    .select('entry.id');

  if (match === 'headword') {
    subq.where('entry.headword', '~*', mungedSearch);
  } else {
    subq
      .join('sense', 'sense.entry_id', 'entry.id')
      .join('sense_gloss', 'sense_gloss.sense_id', 'sense.id')
      .where('sense_gloss.txt', '~*', mungedSearch);
  }

  if (noset) {
    subq.whereNotExists(function () {
      this.select('*').from('set_member').where('set_member.entry_id', knex.ref('entry.id'));
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
      subq
        .join('source', 'source.id', 'entry.source_id')
        .where('source.language_id', arrayCmp(new Set(lang)));
    }
  }

  const q = knex
    .from(subq.as('found'))
    .join('entry_with_senses as entry', 'entry.id', 'found.id')
    .join('source', 'source.id', 'entry.source_id')
    .join('language', 'language.id', 'source.language_id')
    .select(
      'entry.id',
      'entry.headword',
      'entry.senses',
      'language.name as language_name',
      'source.reference as source_reference'
    )
    .orderBy('language.name', 'entry.headword', 'source.reference')
    .limit(max);

  return {
    body: {
      rows: await q,
    },
  };
});
