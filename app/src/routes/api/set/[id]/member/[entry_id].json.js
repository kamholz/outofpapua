import errors from '$lib/errors';
import { getFilteredParams, validateParams } from '$lib/util';
import { requireAuth } from '$lib/auth';
import { sendPgError, transaction } from '$lib/db';

const allowed = new Set(['reflex']);

export const put = validateParams(requireAuth(async ({ body, locals, params }) => {
  const updateParams = getFilteredParams(body, allowed);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noUpdatable } };
  }
  try {
    const ids = await transaction(locals, (trx) =>
      trx('set_member')
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

export const del = validateParams(requireAuth(async ({ locals, params }) => {
  try {
    const ids = await transaction(locals, (trx) =>
      trx('set_member')
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
