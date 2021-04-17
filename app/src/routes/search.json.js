import knex from '$data/knex';

export async function get({ query }) {
  const q = knex('entry')
    .join('source', 'source.id', 'entry.source_id')
    .join('sense', 'sense.entry_id', 'entry.id')
    .join('sense_gloss', 'sense_gloss.sense_id', 'sense.id')
    .join('language', 'language.id', 'source.language_id')
    .join('language as language2', 'language2.id', 'sense_gloss.language_id')
    .select('language.name as language', 'entry.headword','entry.pos','sense_gloss.txt as gloss','language2.name as gloss_language')
    .orderBy('language.name','entry.headword','entry.pos','sense_gloss.txt','language2.name');

  if (query.has('headword')) {
    q.where('entry.headword', query.get('headword'));
  }
  if (query.has('gloss')) {
    q.where('sense_gloss.txt', query.get('gloss'));
  }

  const rows = await q;
  return {
    body: rows
  };
}
