import errors from '$lib/errors';
import { allowed, required, table } from '../_params';
import { getFilteredParams } from '$lib/util';
import { requireAuth } from '$lib/auth';
import { sendPgError, transaction } from '$lib/db';

export const post = requireAuth(async ({ body, context }) => {
  const params = getFilteredParams(body, allowed);
  if (Object.keys(getFilteredParams(params, required)).length !== required.size) {
    return { status: 400, body: { error: errors.missing } };
  }
  if (params.origin === 'inherited' && params.origin_language_id) {
    return { status: 400, body: { error: errors.origin_lang } };
  }
  try {
    const ids = await transaction(context, (trx) =>
      trx(table)
      .returning('id')
      .insert(params)
    );
    return { body: { id: ids[0] } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
