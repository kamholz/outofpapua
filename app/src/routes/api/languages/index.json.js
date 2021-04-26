import knex from '$lib/knex';
import { requireAuth } from '$lib/auth';
import { applySortParams, getFilteredParams, normalizeQuery, setBooleanParams } from '$lib/util';

const table = 'language';

const boolean = new Set(['asc']);
const defaults = {
  asc: true,
  sort: 'name',
};
const sortCols = {
  name: 'lower(language.name)',
  iso6393: 'language.iso6393',
  is_proto: 'protolanguage.id is not null',
  parent_name: 'parent.name',
};

export async function get({ query }) {
  query = normalizeQuery(query);
  setBooleanParams(query, boolean);
  query = {...defaults, ...query};

  const q = knex(table)
    .leftJoin('language as parent', 'parent.id', 'language.parent_id')
    .leftJoin('protolanguage', 'protolanguage.id', 'language.id')
    .select(
      'language.id',
      'language.name',
      'language.iso6393',
      'language.parent_id',
      'parent.name as parent_name',
      knex.raw('protolanguage.id is not null as is_proto')
    );

  if ('borrowedfrom' in query) {
    q.whereRaw('language.flag_borrowed_from');
  } else {
    q.whereRaw('language.flag_language_list');
  }

  applySortParams(q, query, sortCols, ['name']);

  return {
    body: {
      query,
      rows: await q,
    }
  };
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