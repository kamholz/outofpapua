import errors from '$lib/errors';
import { allowed, nfc, required, table } from './_params';
import { applySortParams, knex, sendPgError, transaction } from '$lib/db';
import { ensureNfcParams, getFilteredParams, normalizeQuery, parseBooleanParams, stripParams } from '$lib/util';
import { requireAuth } from '$lib/auth';

const boolean = new Set(['asc']);
const strip = new Set(['category', 'numentries']);
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

export async function get({ query }) {
  query = normalizeQuery(query);
  parseBooleanParams(query, boolean);
  query = { ...defaults, ...query };

  const q = knex(table)
    .join('language', 'language.id', 'source.language_id')
    .select(
      'source.id',
      'source.title',
      'source.reference',
      'language.name as language'
    );

  if (query.category === 'proto') {
    q.whereExists(function () {
      this.select('*').from('protolanguage').where('protolanguage.id', knex.ref('source.language_id'));
    });
  }

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

export const post = requireAuth(async ({ body, context }) => {
  const params = getFilteredParams(body, allowed);
  if (Object.keys(getFilteredParams(params, required)).length !== required.size) {
    return { status: 400, body: { error: errors.missing } };
  }
  ensureNfcParams(params, nfc);
  try {
    const proto = await knex('protolanguage')
      .where({ id: params.language_id })
      .first('id');
    if (!proto) {
      return { status: 400, body: { error: 'can only create new source for proto-languages' } };
    }

    const ids = await transaction(context, (trx) =>
      trx(table)
      .returning('id')
      .insert(params)
    );
    return { body: { id: ids[0] } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
