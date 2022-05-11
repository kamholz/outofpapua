import errors from '$lib/errors';
import { arrayCmp, knex, sendPgError } from '$lib/db';
import { getFilteredParams, isIdArray } from '$lib/util';
import { requireAuth } from '$lib/auth';

const required = new Set(['set_ids']);

export const post = requireAuth(async ({ request }) => {
  const params = getFilteredParams(await request.json(), required);
  if (Object.keys(getFilteredParams(params, required)).length !== required.size) {
    return { status: 400, body: { error: errors.missing } };
  }
  if (!isIdArray(params.set_ids)) {
    return { status: 400 };
  }
  try {
    const id = await knex.transaction(async (trx) => {
      const rows = await trx('set_group')
        .returning('id')
        .insert({});
      const [{ id }] = rows;
      await trx('set')
        .update({ set_group_id: id })
        .where('id', arrayCmp(params.set_ids));
      return id;
    });
    return { body: { id } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
