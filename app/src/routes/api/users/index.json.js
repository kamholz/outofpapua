import knex from '$lib/knex';
import { requireAdmin, requireAuth } from '$lib/auth';
import { getFilteredParams } from '$lib/util';

const table = 'usr';

export const get = requireAuth(async () => {
  const q = knex(table)
    .select('id','username','fullname','admin')
    .orderBy('fullname');  
  return {
    body: {
      rows: await q,
    }
  };
});

const required = new Set(['username','fullname','password']);

export const post = requireAdmin(async ({ body }) => {
  const params = getFilteredParams(body, required);
  if (Object.keys(params).length !== required.size) {
    return { status: 400 };
  }
  params.password = knex.raw("pgcrypto.crypt(?, pgcrypto.gen_salt('md5'))", params.password);
  const rows = await
    knex(table)
      .returning('id')
      .insert(params);
  return rows.length ? { body: { id: rows[0] } } : { status: 500 };
});