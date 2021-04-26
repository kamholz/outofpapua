import knex from '$lib/knex';

const table = 'source';

export async function get() {
  const q = knex(table)
    .join('language', 'language.id', 'source.language_id')
    .select('source.id', 'source.title', 'source.reference', 'language.name as language')
    .orderBy('source.title');
  return {
    body: {
      rows: await q,
    }
  };
}
