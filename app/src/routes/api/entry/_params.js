import { knex } from '$lib/db';

export const table = 'entry';
export const nfc = new Set(['headword', 'headword_normalized', 'root']);

export async function isProto(id) {
  return (await knex.first(
    knex.raw(
      'exists ?',
      knex(table)
      .join('source', 'source.id', 'entry.source_id')
      .join('protolanguage', 'protolanguage.id', 'source.language_id')
      .where('entry.id', id)
    )
  )).length;
}
