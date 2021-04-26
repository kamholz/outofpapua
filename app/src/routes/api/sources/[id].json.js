import knex from '$lib/knex';
import { requireAuth } from '$lib/auth';
import { getFilteredParams } from '$lib/util';

const table = 'source';
const allowed = new Set(['title','reference','reference_full','note']);

export const put = requireAuth(async ({ params, body }) => {
  const toUpdate = getFilteredParams(body, allowed);
  if (!Object.keys(toUpdate).length) {
    return { status: 400 };
  }
  const rows = await knex(table)
    .where('id', params.id)
    .returning('id')
    .update(toUpdate);
  return rows.length ? { status: 200, body: "" } : { status: 404 };
});