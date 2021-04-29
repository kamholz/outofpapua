import { knex, sendPgError } from '$lib/db';
import { requireAuth } from '$lib/auth';
import { getFilteredParams } from '$lib/util';
import errors from '$lib/errors';

const table = 'language';
const allowed = new Set(['name','parent_id','note']);

export const put = requireAuth(async ({ params, body }) => {
  const updateParams = getFilteredParams(body, allowed);
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noupdatable } };
  }
  try {
    const rows = await knex(table)
      .where('id', params.id)
      .returning('id')
      .update(updateParams);
    if (rows.length) {
      return { body: "" };
    }
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});

export const del = requireAuth(async ({ params }) => {
  try {
    const ids = await knex(table)
      .where('id', params.id)
      .returning('id')
      .del();
    if (ids.length) {
      return { body: "" };
    }
  } catch (e) {
    console.log(e);
    return sendPgError(e);    
  }
});