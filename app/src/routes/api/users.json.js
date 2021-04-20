import knex from '$lib/knex';
import { requireAuth } from '$lib/auth';

export const get = requireAuth(handleGet);

async function handleGet() {
  const q = knex('usr')
    .select('username','fullname','admin')
    .orderBy('fullname');
  return {
    body: await q
  };
}
