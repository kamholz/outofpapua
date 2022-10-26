import errors from '$lib/errors';
import { getFilteredParams, jsonError } from '$lib/util';
import { json } from '@sveltejs/kit';
import { knex, pgError, setTransactionUser } from '$lib/db';
import { requireAuth } from '$lib/auth';

const allowed = new Set(['entry_id', 'note', 'reflex', 'reflex_origin', 'reflex_origin_language_id']);
const required = new Set(['entry_id']);

export const POST = requireAuth(async ({ locals, params, request }) => {
  const insertParams = getFilteredParams(await request.json(), allowed);
  if (Object.keys(getFilteredParams(insertParams, required)).length !== required.size) {
    return jsonError(errors.missing);
  }
  try {
    insertParams.set_id = params.id;
    const rows = await knex.transaction(async (trx) => {
      await setTransactionUser(trx, locals);
      return trx('set_member')
        .returning('entry_id')
        .insert(insertParams);
      // would override existing set membership:
      // .onConflict(['entry_id', 'set_id'])
      // .merge([...]);
    });
    return json({ entry_id: rows[0].id });
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
