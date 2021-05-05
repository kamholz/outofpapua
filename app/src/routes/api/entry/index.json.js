import { getFilteredParams, mungeRegex, normalizeQuery, parseBooleanParams } from '$lib/util';
import { knex } from '$lib/db';

const allowed = new Set(['max', 'noset', 'search']);
const boolean = new Set(['noset']);
const defaults = {
  max: 100,
  noset: true,
};

function hasSet() {
  this.select('*').from('set_member').where('set_member.entry_id', knex.ref('entry.id'));
}

export async function get({ query }) {
  query = getFilteredParams(normalizeQuery(query), allowed);
  if (!('search' in query)) {
    return { status: 400, body: { error: 'no search parameter' } };
  }
  parseBooleanParams(query, boolean);
  const { max, noset, search } = { ...defaults, ...query };
  const mungedSearch = mungeRegex(search);

  const q1 = knex('entry')
    .where('entry.headword', '~*', mungedSearch)
    .select('entry.id');

  const q2 = knex('entry')
    .join('sense', 'sense.entry_id', 'entry.id')
    .join('sense_gloss', 'sense_gloss.sense_id', 'sense.id')
    .where('sense_gloss.txt', '~*', mungedSearch)
    .select('entry.id');

  if (noset) {
    q1.whereNotExists(hasSet);
    q2.whereNotExists(hasSet);
  }

  const q = knex
    .from(knex.union([q1, q2]).as('found'))
    .join('entry_with_senses as entry', 'entry.id', 'found.id')
    .join('source', 'source.id', 'entry.source_id')
    .join('language', 'language.id', 'source.language_id')
    .select(
      'entry.id',
      'entry.headword',
      'entry.pos',
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
}
