import { knex, sendPgError } from '$lib/db';
import { requireAdmin, requireAuth } from '$lib/auth';
import { getFilteredParams } from '$lib/util';
import errors from '$lib/errors';

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
    return { status: 400, body: { error: errors.missing } };
  }
  params.password = knex.raw("pgcrypto.crypt(?, pgcrypto.gen_salt('md5'))", params.password);
  try {
    const ids = await knex(table)
      .returning('id')
      .insert(params);
    return { body: { id: ids[0] } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});