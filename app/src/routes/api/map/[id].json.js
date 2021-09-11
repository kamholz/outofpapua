import errors from '$lib/errors';
import { allowed } from './_params';
import { getFilteredParams, validateParams } from '$lib/util';
import { knex, sendPgError, transaction } from '$lib/db';
import { requireAuth } from '$lib/auth';

export const get = validateParams(requireAuth(async ({ params }) => {
  const q = knex('map')
    .where('map.id', params.id)
    .first(
      'map.id',
      'map.data',
      'map.name'
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
      trx('map')
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
