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
    let found = false;
    await transaction(locals, async (trx) => {
      const set = await trx('set').first('note').where('id', params.id);
      if (set) {
        found = true;

        const notes = [
          set.note,
          ...await trx('set').pluck('note').where('id', arrayCmp(updateParams.set_ids)),
        ].filter((v) => v !== null);
        const note = notes.length ? notes.join('\n\n') : null;
        if (note !== set.note) {
          await trx('set').update({ note }).where('id', params.id);
        }

        return trx('set_member')
          .update({ set_id: params.id })
          .where('set_id', arrayCmp(updateParams.set_ids));
      }
    });
    return found ? { body: '' } : { status: 400 };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
}));
