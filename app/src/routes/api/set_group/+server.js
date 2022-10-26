import errors from '$lib/errors';
import { arrayCmp, knex, pgError } from '$lib/db';
import { error, json } from '@sveltejs/kit';
import { getFilteredParams, isIdArray, jsonError } from '$lib/util';
import { requireAuth } from '$lib/auth';

const required = new Set(['set_ids']);

export const POST = requireAuth(async ({ request }) => {
  const params = getFilteredParams(await request.json(), required);
  if (Object.keys(getFilteredParams(params, required)).length !== required.size) {
    return jsonError(errors.missing);
  }
  if (!isIdArray(params.set_ids)) {
    throw error(400);
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
    return json({ id });
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
