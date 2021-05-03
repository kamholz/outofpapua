import errors from '$lib/errors';
import { getFilteredParams } from '$lib/util';
import { requireAuth } from '$lib/auth';
import { sendPgError, transaction } from '$lib/db';
import { table } from '../_params';

export const allowed = new Set(['entry_id', 'note', 'origin', 'origin_language_id']);
export const required = new Set(['entry_id']);

export const post = requireAuth(async ({ body, context, params }) => {
  const insertParams = getFilteredParams(body, allowed);
  if (Object.keys(getFilteredParams(insertParams, required)).length !== required.size) {
    return { status: 400, body: { error: errors.missing } };
  }
  if (insertParams.origin === 'inherited' && insertParams.origin_language_id) {
    return { status: 400, body: { error: errors.origin_lang } };
  }
  try {
    const ids = await transaction(context, (trx) =>
      trx.with('updated', (q) => {
        q.from('entry')
        .update({ set_id: Number(params.id) });
      })
      .from(table)
      .returning('id')
      .insert(insertParams)
    );
    return { body: { id: ids[0] } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
