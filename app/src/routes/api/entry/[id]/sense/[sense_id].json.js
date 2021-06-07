import errors from '$lib/errors';
import { allowed, table } from './_params';
import { getFilteredParams } from '$lib/util';
import { isEditable } from '../../_params';
import { requireAuth } from '$lib/auth';
import { sendPgError, transaction } from '$lib/db';

export const put = requireAuth(async ({ body, locals, params }) => {
  const updateParams = getFilteredParams(body, allowed);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noUpdatable } };
  }
  try {
    const rows = await transaction(locals, (trx) =>
      trx(table)
      .where('id', Number(params.sense_id))
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

export const del = requireAuth(async ({ locals, params }) => {
  try {
    const editable = await isEditable(Number(params.id));
    if (!editable) {
      return { status: 400, body: { error: errors.editableEntry } };
    }
    const ids = await transaction(locals, (trx) =>
      trx(table)
      .where('id', Number(params.sense_id))
      .returning('id')
      .del()
    );
    return { body: { deleted: ids.length } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
