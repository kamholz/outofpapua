import errors from '$lib/errors';
import { ensureNfcParams, getFilteredParams } from '$lib/util';
import { knex, sendPgError } from '$lib/db';
import { nfc, table } from './_params';
import { requireAuth } from '$lib/auth';

const allowed = new Set(['name', 'parent_id', 'note']);

export const put = requireAuth(async ({ params, body }) => {
  const updateParams = getFilteredParams(body, allowed);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noupdatable } };
  }
  ensureNfcParams(updateParams, nfc);
  try {
    const rows = await knex(table)
      .where('id', Number(params.id))
      .returning('id')
      .update(updateParams);
    if (rows.length) {
      return { body: '' };
    }
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});

export const del = requireAuth(async ({ params }) => {
  try {
    const ids = await knex(table)
      .where('id', Number(params.id))
      .returning('id')
      .del();
    if (ids.length) {
      return { body: '' };
    }
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
