import knex from '$lib/knex';
import { requireAuth } from '$lib/auth';
import { getFilteredParams } from '$lib/util';

const table = 'language';

export async function get() {
  const q = knex(table)
    .leftJoin('language as parent', 'parent.id', 'language.parent_id')
    .leftJoin('protolanguage', 'protolanguage.id', 'language.id')
    .select('language.id', 'language.name', 'language.iso6393', 'language.parent_id', 'parent.name as parent_name', knex.raw('protolanguage.id is not null as is_proto'))
    .whereNotNull('protolanguage.id')
    .orWhereExists(function () {
      this
        .select('*')
        .from('source')
        .where('source.language_id', knex.ref('language.id'))
    })
    .orderBy(knex.raw('lower(language.name)'));
  return { body: await q };
}

const required = new Set(['name']);

export const post = requireAuth(async ({ body }) => {
  const params = getFilteredParams(body, required);
  if (Object.keys(params).length !== required.size) {
    return { status: 400 };
  }
  const rows = await
    knex.with('inserted', q => {
      q.from(table)
      .returning('id')
      .insert(params);
    })
    .from('protolanguage')
    .returning('id')
    .insert(function () {
      this.select('id').from('inserted');
    })
  return rows.length ? { body: { id: rows[0] } } : { status: 500 };
});