import errors from '$lib/errors';
import { allowed, table } from '../_params';
import { getFilteredParams } from '$lib/util';
import { knex, sendPgError, transaction } from '$lib/db';
import { requireAuth } from '$lib/auth';

export async function get({ params }) {
  const row = await knex('set_with_members as set')
    .where('set.id', Number(params.id))
    .first(
      'set.id',
      'set.note',
      'set.members'
    );
  if (row) {
    return { body: row };
  }
}

export const put = requireAuth(async ({ body, context, params }) => {
  const updateParams = getFilteredParams(body, allowed);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noupdatable } };
  }
  try {
    const ids = await transaction(context, (trx) =>
      trx(table)
      .where('id', Number(params.id))
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
});

export const del = requireAuth(async ({ context, params }) => {
  try {
    const ids = await transaction(context, (trx) =>
      trx(table)
      .where('id', Number(params.id))
      .returning('id')
      .del()
    );
    return { body: { deleted: ids.length } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
