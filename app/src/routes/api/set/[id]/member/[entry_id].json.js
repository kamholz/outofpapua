import errors from '$lib/errors';
import { allowed, table } from '../_params';
import { getFilteredParams } from '$lib/util';
import { requireAuth } from '$lib/auth';
import { sendPgError, transaction } from '$lib/db';

export const put = requireAuth(async ({ body, context, params }) => {
  const updateParams = getFilteredParams(body, allowed);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.no_updatable } };
  }
  if (updateParams.origin === 'inherited' && updateParams.origin_language_id) {
    return { status: 400, body: { error: errors.origin_lang } };
  }
  if ('origin' in updateParams && updateParams.origin !== 'borrowed') {
    updateParams.origin_language_id = null;
  }
  try {
    const ids = await transaction(context, (trx) =>
      trx(table)
      .where({ set_id: Number(params.id), entry_id: Number(params.entry_id) })
      .returning('set_id')
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
      .where({ set_id: Number(params.id), entry_id: Number(params.entry_id) })
      .returning('set_id')
      .del()
    );
    return { body: { deleted: ids.length } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
