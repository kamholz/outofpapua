import errors from '$lib/errors';
import { allowed, nfc } from '../_params';
import { ensureNfcParams, getFilteredParams, validateParams } from '$lib/util';
import { filterPublicSources, knex, sendPgError, transaction } from '$lib/db';
import { requireAuth } from '$lib/auth';

const allowedAdmin = new Set([...allowed, 'public']);

const columns = [
  'source.id',
  'source.reference',
  'source.reference_full',
  'source.language_id',
  'source.note',
  'source.editable',
  'language.name as language_name',
  knex.raw('protolanguage.id is not null as is_proto'),
];
const columnsLoggedIn = columns.concat('source.public');

export const get = validateParams(async ({ locals, params }) => {
  const q = knex('source')
    .join('language', 'language.id', 'source.language_id')
    .leftJoin('protolanguage', 'protolanguage.id', 'language.id')
    .leftJoin('entry', 'entry.source_id', 'source.id')
    .count('entry.id as numentries')
    .where('source.id', params.id)
    .first(locals.user ? columnsLoggedIn : columns)
    .groupBy('source.id', 'protolanguage.id', 'language.name');
  filterPublicSources(q, locals);
  const row = await q;
  if (row) {
    return { body: row };
  } else {
    return { status: 404, body: '' };
  }
});

export const put = validateParams(requireAuth(async ({ body, locals, params }) => {
  const updateParams = getFilteredParams(body, locals.user?.admin ? allowedAdmin : allowed);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noUpdatable } };
  }
  ensureNfcParams(params, nfc);
  try {
    const ids = await transaction(locals, (trx) =>
      trx('source')
      .where('id', params.id)
      .returning('id')
      .update(updateParams)
    );
    if (ids.length) {
      return { body: '' };
    }
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
}));
