import { allowed, table } from './_params';
import { getFilteredParams } from '$lib/util';
import { requireAuth } from '$lib/auth';
import { sendPgError, transaction } from '$lib/db';

export const post = requireAuth(async ({ body, context }) => {
  const params = getFilteredParams(body, allowed);
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
