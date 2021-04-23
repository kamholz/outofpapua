import knex from '$lib/knex';
import { requireAuth } from '$lib/auth';

export const get = requireAuth(async () => {
  const q = knex('usr')
    .select('id','username','fullname','admin')
    .orderBy('fullname');  
  return { body: await q };
});
