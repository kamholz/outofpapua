import errors from '$lib/errors';
import { error, json } from '@sveltejs/kit';
import { getFilteredParams } from '$lib/util';
import { jsonError, knex, pgError, setTransactionUser } from '$lib/db';
import { requireAuth } from '$lib/auth';

const allowed = new Set(['note', 'reflex', 'reflex_origin', 'reflex_origin_language_id']);

export const PUT = requireAuth(async ({ locals, params, request }) => {
  const updateParams = getFilteredParams(await request.json(), allowed);
  if (!Object.keys(updateParams).length) {
    return jsonError(errors.noUpdatable);
  }
  if ('reflex_origin' in updateParams && updateParams.reflex_origin !== 'borrowed') {
    if (updateParams.reflex_origin_language_id) {
      return jsonError(errors.originLang);
    }
    updateParams.reflex_origin_language_id = null; // clear any existing reflex_origin_language_id
  }
  try {
    const rows = await knex.transaction(async (trx) => {
      await setTransactionUser(trx, locals);
      return trx('set_member')
        .where('set_id', params.id)
        .where('entry_id', params.entry_id)
        .returning('entry_id')
        .update(updateParams);
    });
    if (rows.length) {
      return new Response(null);
    } else {
      throw error(404);
    }
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});

export const DELETE = requireAuth(async ({ locals, params }) => {
  try {
    const rows = await knex.transaction(async (trx) => {
      await setTransactionUser(trx, locals);
      return trx('set_member')
        .where('set_id', params.id)
        .where('entry_id', params.entry_id)
        .returning('entry_id')
        .del();
    });
    return json({ deleted: rows.length });
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
