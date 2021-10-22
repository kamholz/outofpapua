import errors from '$lib/errors';
import { getFilteredParams, validateParams } from '$lib/util';
import { knex, sendPgError } from '$lib/db';
import { requireAuth } from '$lib/auth';

const allowed = new Set(['note', 'reflex', 'reflex_origin']);

export const put = validateParams(requireAuth(async ({ body, params }) => {
  const updateParams = getFilteredParams(body, allowed);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noUpdatable } };
  }
  try {
    const ids = await knex.transaction((trx) =>
      trx('set_member')
      .where('set_id', params.id)
      .where('entry_id', params.entry_id)
      .returning('entry_id')
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

export const del = validateParams(requireAuth(async ({ params }) => {
  try {
    const ids = await knex.transaction((trx) =>
      trx('set_member')
      .where('set_id', params.id)
      .where('entry_id', params.entry_id)
      .returning('entry_id')
      .del()
    );
    return { body: { deleted: ids.length } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
}));
