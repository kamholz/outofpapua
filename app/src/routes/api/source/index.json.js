import errors from '$lib/errors';
import { allowed, allowedAdmin, nfc, required } from './_params';
import { applySortParams, filterPublicSources, knex, sendPgError } from '$lib/db';
import { ensureNfcParams, getFilteredParams, normalizeQuery, parseBooleanParams, stripParams } from '$lib/util';
import { requireAuth } from '$lib/auth';

const allowedQuery = new Set(['asc', 'category', 'details', 'sort']);
const boolean = new Set(['asc', 'details']);
const strip = new Set(['category', 'details']);
const defaults = {
  asc: true,
  details: false,
  sort: 'reference',
};
const sortCols = {
  reference: 'lower(source.reference)',
  language: 'language.name',
};
const sortColsDetails = {
  ...sortCols,
  numentries: 'count(entry.id)',
};

export async function get({ locals, url: { searchParams } }) {
  let query = getFilteredParams(normalizeQuery(searchParams), allowedQuery);
  parseBooleanParams(query, boolean);
  query = { ...defaults, ...query };

  const q = knex('source')
    .join('language', 'language.id', 'source.language_id')
    .select(
      'source.id',
      'source.reference',
      'language.name as language'
    );
  filterPublicSources(q, locals);

  if (query.category === 'proto') {
    q.whereExists(function () {
      this.select('*').from('protolanguage').where('protolanguage.id', knex.ref('source.language_id'));
    });
  } else if (query.category === 'editable') {
    q.whereRaw('source.editable');
  }

  if (query.details) {
    q
      .leftJoin('entry', 'entry.source_id', 'source.id')
      .count('entry.id as numentries')
      .groupBy('source.id', 'language.name');
  }

  applySortParams(q, query, query.details ? sortColsDetails : sortCols, ['reference', 'language']);
  stripParams(query, strip);

  return {
    body: {
      query,
      rows: await q,
    },
  };
}

export const post = requireAuth(async ({ body, locals }) => {
  const params = getFilteredParams(body, locals.user?.admin ? allowedAdmin : allowed);
  if (Object.keys(getFilteredParams(params, required)).length !== required.size) {
    return { status: 400, body: { error: errors.missing } };
  }
  ensureNfcParams(params, nfc);
  try {
    const proto = await knex('protolanguage')
      .where('id', params.language_id)
      .first('id');
    if (!proto) {
      return { status: 400, body: { error: 'can only create new source for proto-languages' } };
    }

    params.editable = true;
    const ids = await knex.transaction((trx) =>
      trx('source')
      .returning('id')
      .insert(params)
    );
    return { body: { id: ids[0] } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
