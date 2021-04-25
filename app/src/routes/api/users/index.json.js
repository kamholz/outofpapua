import knex from '$lib/knex';
import { requireAuth } from '$lib/auth';

const table = 'usr';

export const get = requireAuth(async () => {
  const q = knex(table)
    .select('id','username','fullname','admin')
    .orderBy('fullname');  
  return { body: await q };
});
