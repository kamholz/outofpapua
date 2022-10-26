import { knex } from '$lib/db';

export const nfc = new Set(['gloss', 'headword', 'headword_ipa', 'root']);

export async function isEditable(id) {
  return Boolean(await knex('entry')
    .join('source', 'source.id', 'entry.source_id')
    .where('entry.id', id)
    .whereRaw('source.editable')
    .first('entry.id')
  );
}
