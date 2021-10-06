import errors from '$lib/errors';
import { arrayCmp, sendPgError, transaction } from '$lib/db';
import { getFilteredParams, isIdArray, validateParams } from '$lib/util';
import { requireAuth } from '$lib/auth';

const allowed = new Set(['set_ids']);
const required = new Set(['set_ids']);

export const post = validateParams(requireAuth(async ({ body, locals, params }) => {
  const updateParams = getFilteredParams(body, allowed);
  if (Object.keys(updateParams).length !== required.size) {
    return { status: 400, body: { error: errors.missing } };
  }
  if (!isIdArray(updateParams.set_ids)) {
    return { status: 400, body: { error: '"set_ids" parameter must be an array of set ids' } };
  }
  try {
    await transaction(locals, (trx) =>
      trx('set_member')
      .update({ set_id: params.id })
      .where('set_id', arrayCmp(updateParams.set_ids))
    );
    return { body: '' };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
}));
