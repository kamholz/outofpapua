import errors from '$lib/errors';
import { getFilteredParams } from '$lib/util';
import { knex, sendPgError, setTransactionUser } from '$lib/db';
import { requireAuth } from '$lib/auth';

const allowed = new Set(['note', 'reflex', 'reflex_origin', 'reflex_origin_language_id']);

export const put = requireAuth(async ({ locals, params, request }) => {
  const updateParams = getFilteredParams(await request.json(), allowed);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noUpdatable } };
  }
  if ('reflex_origin' in updateParams && updateParams.reflex_origin !== 'borrowed') {
    if (updateParams.reflex_origin_language_id) {
      return { status: 400, body: { error: errors.originLang } };
    }
    updateParams.reflex_origin_language_id = null; // clear any existing reflex_origin_language_id
  }
  try {
    const ids = await knex.transaction(async (trx) => {
      await setTransactionUser(trx, locals);
      return trx('set_member')
        .where('set_id', params.id)
        .where('entry_id', params.entry_id)
        .returning('entry_id')
        .update(updateParams);
    });
    if (ids.length) {
      return { body: '' };
    }
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});

export const del = requireAuth(async ({ locals, params }) => {
  try {
    const ids = await knex.transaction(async (trx) => {
      await setTransactionUser(trx, locals);
      return trx('set_member')
        .where('set_id', params.id)
        .where('entry_id', params.entry_id)
        .returning('entry_id')
        .del();
    });
    return { body: { deleted: ids.length } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
