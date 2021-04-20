import knex from '$lib/knex';

export async function get() {
  const q = knex('language')
    .leftJoin('language as parent', 'parent.id', 'language.parent_id')
    .leftJoin('protolanguage', 'protolanguage.id', 'language.id')
    .select('language.id', 'language.name', 'language.iso6393', 'parent.name as parent_name', knex.raw('protolanguage.id is not null as is_proto'))
    .whereNotNull('protolanguage.id')
    .orWhereExists(function () {
      this
        .select('*')
        .from('source')
        .where('source.language_id', knex.ref('language.id'))
    })
    .orderBy('language.name');

  return {
    body: await q
  };
}
