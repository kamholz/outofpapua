import { knex } from '$lib/db';
import { requireAuth } from '$lib/auth';

export const get = requireAuth(async ({ params }) => {
  const log = await knex(knex.raw('set_log(?)', params.id)).select('*');
  return { body: { log } };
});
