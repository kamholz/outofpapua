import { allowed, allowedEditor, nfc, required } from './params';
import { applySortParams, filterPublicSources, knex, pgError } from '$lib/db';
import { ensureNfcParams, getFilteredParams, isEditor, normalizeQuery, parseBooleanParams,
  stripParams } from '$lib/util';
import { errorStrings, jsonError } from '$lib/error';
import { json } from '@sveltejs/kit';
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

export async function GET({ locals, url: { searchParams } }) {
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

  return json({
    query,
    rows: await q,
  });
}

export const POST = requireAuth(async ({ locals, request }) => {
  const params = getFilteredParams(await request.json(), isEditor(locals.user) ? allowedEditor : allowed);
  if (Object.keys(getFilteredParams(params, required)).length !== required.size) {
    return jsonError(errorStrings.missing);
  }
  ensureNfcParams(params, nfc);
  try {
    const proto = await knex('protolanguage')
      .where('id', params.language_id)
      .first('id');
    if (!proto) {
      return jsonError('can only create new source for proto-languages');
    }

    params.editable = true;
    const rows = await knex.transaction((trx) =>
      trx('source')
      .returning('id')
      .insert(params)
    );
    return json({ id: rows[0].id });
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
