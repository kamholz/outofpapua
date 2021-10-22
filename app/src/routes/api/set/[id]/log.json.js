import { knex } from '$lib/db';
import { requireAuth } from '$lib/auth';
import { validateParams } from '$lib/util';

export const get = validateParams(requireAuth(async ({ params }) => {
  const log = await knex(knex.raw('set_log(?)', params.id)).select('*');
  return { body: { log } };
}));
