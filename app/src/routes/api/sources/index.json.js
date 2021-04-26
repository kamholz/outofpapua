import knex from '$lib/knex';
import { applySortParams, normalizeQuery, setBooleanParams } from '$lib/util';

const table = 'source';

const boolean = new Set(['asc']);
const defaults = {
  asc: true,
  sort: 'title',
};
const sortCols = {
  title: 'lower(source.title)',
  reference: 'source.reference',
  language: 'language.name',
};

export async function get({ query }) {
  query = normalizeQuery(query);
  setBooleanParams(query, boolean);
  query = {...defaults, ...query};

  const q = knex(table)
    .join('language', 'language.id', 'source.language_id')
    .select(
      'source.id',
      'source.title',
      'source.reference',
      'source.reference_full',
      'language.name as language'
    );
 
  applySortParams(q, query, sortCols, ['title','language','reference']);
 
  return {
    body: {
      query,
      rows: await q,
    }
  };
}