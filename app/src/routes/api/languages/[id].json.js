import knex from '$lib/knex';
import { requireAuth } from '$lib/auth';
import { filteredParams } from '$lib/util';

const updatable = new Set(['name','parent_id']);

export const post = requireAuth(async ({ params, body }) => {
  if (!params.id.match(/^[0-9]+$/)) {
    return { status: 400 };
  }
  const toUpdate = filteredParams(body, updatable);
  if (Object.keys(toUpdate).length) {
    try {
      await knex('language')
        .where('id', params.id)
        .update(toUpdate);
    } catch (e) {
      console.log(e);
      return { status: 500 };
    }
  }
  return { status: 200, body: "" };
});
