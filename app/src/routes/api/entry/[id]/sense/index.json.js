import { allowed, table } from './_params';
import { getFilteredParams } from '$lib/util';
import { isProto } from '../../_params';
import { requireAuth } from '$lib/auth';
import { sendPgError, transaction } from '$lib/db';

export const post = requireAuth(async ({ body, locals, params }) => {
  const insertParams = getFilteredParams(body, allowed);
  try {
    const entryId = Number(params.id);
    const proto = await isProto(entryId);
    if (!proto) {
      return { status: 400, body: { error: 'entry does not exist or is not for protolanguage' } };
    }
    insertParams.entry_id = entryId;

    const ids = await transaction(locals, (trx) =>
      trx(table)
      .returning('id')
      .insert(insertParams)
    );
    return { body: { id: ids[0] } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
