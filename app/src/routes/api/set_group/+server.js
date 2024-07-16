import { arrayCmp, knex, pgError } from '$lib/db';
import { error, json } from '@sveltejs/kit';
import { errorStrings, jsonError } from '$lib/error';
import { getFilteredParams, isIdArray } from '$lib/util';
import { requireContributor } from '$lib/auth';

const required = new Set(['set_ids']);

export const POST = requireContributor(async ({ request }) => {
  const params = getFilteredParams(await request.json(), required);
  if (Object.keys(getFilteredParams(params, required)).length !== required.size) {
    return jsonError(errorStrings.missing);
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
