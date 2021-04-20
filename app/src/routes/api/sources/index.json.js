import knex from '$lib/knex';

export async function get() {
  const q = knex('source')
    .join('language', 'language.id', 'source.language_id')
    .select('source.id', 'source.title', 'source.reference', 'language.name as language')
    .orderBy('source.title');
  return {
    body: await q
  };
}
