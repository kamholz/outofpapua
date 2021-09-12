import errors from '$lib/errors';
import { allowed } from './_params';
import { getFilteredParams, validateParams } from '$lib/util';
import { knex, sendPgError, transaction } from '$lib/db';
import { requireAuth } from '$lib/auth';

export const get = validateParams(requireAuth(async ({ params }) => {
  const q = knex('saved_map')
    .where('saved_map.id', params.id)
    .first(
      'saved_map.id',
      'saved_map.data',
      'saved_map.name'
    );
  const row = await q;
  if (row) {
    return { body: row };
  } else {
    return { status: 404, body: '' };
  }
}));

export const put = validateParams(requireAuth(async ({ body, locals, params }) => {
  const updateParams = getFilteredParams(body, allowed);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noUpdatable } };
  }
  try {
    const ids = await transaction(locals, (trx) =>
      trx('saved_map')
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

export const del = validateParams(requireAuth(async ({ locals, params }) => {
  try {
    const ids = await transaction(locals, (trx) =>
      trx('saved_map')
      .where('id', params.id)
      .returning('id')
      .del()
    );
    return { body: { deleted: ids.length } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
}));
