import { applySortParams, knex } from '$lib/db';
import { normalizeQuery, parseBooleanParams, stripParams } from '$lib/util';

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
  numentries: 'count(entry.id)',
};
const strip = new Set(['numentries']);

export async function get({ query }) {
  query = normalizeQuery(query);
  parseBooleanParams(query, boolean);
  query = {...defaults, ...query};

  const q = knex(table)
    .join('language', 'language.id', 'source.language_id')
    .select(
      'source.id',
      'source.title',
      'source.reference',
      //'source.reference_full',
      'language.name as language'
    );
 
  if ('numentries' in query) {
    q
      .leftJoin('entry', 'entry.source_id', 'source.id')
      .count('entry.id as numentries')
      .groupBy('source.id', 'language.name');
  }

  applySortParams(q, query, sortCols, ['title','language','reference']);
 
  stripParams(query, strip);
  return {
    body: {
      query,
      rows: await q,
    }
  };
}