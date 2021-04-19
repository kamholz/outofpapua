import knex from '$data/knex';
import { normalizeQuery } from '$utils';

export async function get({ query }) {
  query = normalizeQuery(query);
  const caseSensitive = false;

  if (!['headword','gloss'].some(attr => attr in query)) {
    return {
      status: 400,
      body: ""
    };
  }

  const q = knex('entry')
    .join('source', 'source.id', 'entry.source_id')
    .join('language', 'language.id', 'source.language_id')
    .join('sense', 'sense.entry_id', 'entry.id')
    .join('sense_gloss', 'sense_gloss.sense_id', 'sense.id')
    .join('language as language2', 'language2.id', 'sense_gloss.language_id')
    .select('language.name as language', 'entry.headword','entry.pos','sense_gloss.txt as gloss','language2.name as gloss_language')
    .orderBy('language.name','entry.headword','entry.pos','sense_gloss.txt','language2.name');

  if ('headword' in query) {
    q.where('entry.headword', ...match(query.headword, caseSensitive));
  }
  if ('gloss' in query) {
    q.where('sense_gloss.txt', ...match(query.gloss, caseSensitive));
  }

  const rows = await q;
  return {
    body: rows
  };
}

function match(value, caseSensitive) {
  if (caseSensitive) {
    return ['~', value];
  } else {
    return ['~*', value];
  }
}
