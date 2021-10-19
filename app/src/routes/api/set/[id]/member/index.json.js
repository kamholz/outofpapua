import errors from '$lib/errors';
import { getFilteredParams, validateParams } from '$lib/util';
import { requireAuth } from '$lib/auth';
import { sendPgError, transaction } from '$lib/db';

const allowed = new Set(['entry_id', 'note', 'reflex', 'reflex_origin']);
const required = new Set(['entry_id']);

export const post = validateParams(requireAuth(async ({ body, locals, params }) => {
  const insertParams = getFilteredParams(body, allowed);
  if (Object.keys(getFilteredParams(insertParams, required)).length !== required.size) {
    return { status: 400, body: { error: errors.missing } };
  }
  try {
    insertParams.set_id = params.id;
    const ids = await transaction(locals, (trx) =>
      trx('set_member')
      .returning('entry_id')
      .insert(insertParams)
      // would override existing set membership:
      // .onConflict(['entry_id', 'set_id'])
      // .merge([...]);
    );
    return { body: { entry_id: ids[0] } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
}));
