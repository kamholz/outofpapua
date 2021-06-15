import { knex } from '$lib/db';

export const table = 'entry';
export const nfc = new Set(['gloss', 'headword', 'headword_normalized', 'root']);

export async function isEditable(id) {
  return Boolean(await knex(table)
    .join('source', 'source.id', 'entry.source_id')
    .where('entry.id', id)
    .whereRaw('source.editable')
    .first('entry.id')
  );
}
