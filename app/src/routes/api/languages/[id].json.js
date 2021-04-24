import knex from '$lib/knex';
import { requireAuth } from '$lib/auth';
import { getFilteredParams } from '$lib/util';

const updatable = new Set(['name','parent_id']);

export const put = requireAuth(async ({ params, body }) => {
  const toUpdate = getFilteredParams(body, updatable);
  if (!Object.keys(toUpdate).length) {
    return { status: 400 };
  }
  const rows = await knex('language')
    .where('id', params.id)
    .returning('id')
    .update(toUpdate);
  return rows.length ? { status: 200, body: "" } : { status: 404 };
});
