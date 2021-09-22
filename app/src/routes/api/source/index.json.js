import errors from '$lib/errors';
import { allowed, allowedAdmin, nfc, required } from './_params';
import { applySortParams, filterLanguageList, filterPublicSources, knex, sendPgError, transaction } from '$lib/db';
import { ensureNfcParams, getFilteredParams, normalizeQuery, parseBooleanParams, stripParams } from '$lib/util';
import { requireAuth } from '$lib/auth';
import { viewSet } from '$lib/preferences';

const boolean = new Set(['asc']);
const strip = new Set(['category', 'numentries']);
const defaults = {
  asc: true,
  sort: 'reference',
};
const sortCols = {
  reference: 'source.reference',
  language: 'language.name',
  numentries: 'count(entry.id)',
};

export async function get({ locals, query }) {
  query = normalizeQuery(query);
  if (!('view' in query) || !viewSet.has(query.view)) {
    return { status: 400, body: { error: errors.view } };
  }
  parseBooleanParams(query, boolean);
  query = { ...defaults, ...query };

  const q = knex('source')
    .join('language', 'language.id', 'source.language_id')
    .select(
      'source.id',
      'source.reference',
      'language.name as language'
    );
  filterLanguageList(q, 'source.language_id', query.view);
  filterPublicSources(q, locals);

  if (query.category === 'proto') {
    q.whereExists(function () {
      this.select('*').from('protolanguage').where('protolanguage.id', knex.ref('source.language_id'));
    });
  } else if (query.category === 'editable') {
    q.whereRaw('source.editable');
  }

  if ('numentries' in query) {
    q
      .leftJoin('entry', 'entry.source_id', 'source.id')
      .count('entry.id as numentries')
      .groupBy('source.id', 'language.name');
  }

  applySortParams(q, query, sortCols, ['reference', 'language']);
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
    const ids = await transaction(locals, (trx) =>
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
