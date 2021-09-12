import errors from '$lib/errors';
import { allowed, required } from './_params';
import { getFilteredParams } from '$lib/util';
import { knex, sendPgError, transaction } from '$lib/db';
import { requireAuth } from '$lib/auth';

export const get = requireAuth(async ({ locals }) => {
  const q = knex('saved_map')
    .where('saved_map.usr_id', locals.user.id)
    .select(
      'saved_map.name'
    )
    .orderBy('saved_map.name');

  return {
    body: {
      rows: await q,
    },
  };
});

export const post = requireAuth(async ({ body, locals }) => {
  const params = getFilteredParams(body, allowed);
  if (Object.keys(getFilteredParams(params, required)).length !== required.size) {
    return { status: 400, body: { error: errors.missing } };
  }
  params.usr_id = locals.user.id;
  try {
    const ids = await transaction(locals, (trx) =>
      trx('saved_map')
      .returning('id')
      .insert(params)
    );
    return { body: { id: ids[0] } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
