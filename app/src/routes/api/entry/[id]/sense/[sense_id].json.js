import errors from '$lib/errors';
import { getFilteredParams } from '$lib/util';
import { requireAuth } from '$lib/auth';
import { sendPgError, transaction } from '$lib/db';
import { table } from './_params';

const allowed = new Set(['note']);

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
