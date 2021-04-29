import { applySortParams, knex, sendPgError } from '$lib/db';
import { getFilteredParams, normalizeQuery, parseBooleanParams, stripParams } from '$lib/util';
import { requireAuth } from '$lib/auth';

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
  query = { ...defaults, ...query };

  const q = knex(table)
    .join('language', 'language.id', 'source.language_id')
    .leftJoin('protolanguage', 'protolanguage.id', 'language.id')
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

  applySortParams(q, query, sortCols, ['title', 'language', 'reference']);

  stripParams(query, strip);
  return {
    body: {
      query,
      rows: await q,
    },
  };
}

const allowed = new Set(['language_id', 'note', 'reference', 'reference_full', 'title']);
const required = new Set(['language_id', 'reference', 'title']);

export const post = requireAuth(async ({ body }) => {
  const params = getFilteredParams(body, allowed);
  if (Object.keys(getFilteredParams(params, required)).length !== required.size) {
    return { status: 400, body: { error: errors.missing } };
  }
  try {
    const proto = await knex('protolanguage')
      .where({ id: params.language_id })
      .first('id');
    if (!proto) {
      return { status: 400, body: { error: 'can only create new source for proto-languages' } };
    }

    const ids = await knex(table)
      .returning('id')
      .insert(params);
    return { body: { id: ids[0] } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
