import errors from '$lib/errors';
import { getFilteredParams } from '$lib/util';
import { requireAuth } from '$lib/auth';
import { sendPgError, transaction } from '$lib/db';
import { table } from '../_params';

export const allowed = new Set(['note', 'origin', 'origin_language_id']);

export const put = requireAuth(async ({ body, context, params }) => {
  const updateParams = getFilteredParams(body, allowed);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noUpdatable } };
  }
  if (updateParams.origin === 'inherited' && updateParams.origin_language_id) {
    return { status: 400, body: { error: errors.originLang } };
  }
  if ('origin' in updateParams && updateParams.origin !== 'borrowed') {
    updateParams.origin_language_id = null;
  }
  try {
    const ids = await transaction(context, (trx) =>
      trx(table)
      .where({ entry_id: Number(params.entry_id) })
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
});

export const del = requireAuth(async ({ context, params }) => {
  try {
    const ids = await transaction(context, (trx) =>
      trx(table)
      .where({ entry_id: Number(params.entry_id) })
      .returning('entry_id')
      .del()
    );
    return { body: { deleted: ids.length } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
