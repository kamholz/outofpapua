import errors from '$lib/errors';
import { ensureNfcParams, getFilteredParams } from '$lib/util';
import { nfc, table } from './_params';
import { requireAuth } from '$lib/auth';
import { sendPgError, transaction } from '$lib/db';

const allowed = new Set(['name', 'parent_id', 'note']);

export const put = requireAuth(async ({ body, context, params }) => {
  const updateParams = getFilteredParams(body, allowed);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noUpdatable } };
  }
  ensureNfcParams(updateParams, nfc);
  try {
    const rows = await transaction(context, (trx) =>
      trx(table)
      .where('id', Number(params.id))
      .returning('id')
      .update(updateParams)
    );
    if (rows.length) {
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
