import errors from '$lib/errors';
import { ensureNfcParams, getFilteredParams, jsonError } from '$lib/util';
import { json } from '@sveltejs/kit';
import { knex, pgError } from '$lib/db';
import { nfc } from './params';
import { requireAdmin, requireAuth } from '$lib/auth';

export const GET = requireAuth(async () => {
  const q = knex('usr')
    .select('id', 'username', 'fullname', 'admin')
    .orderBy('fullname');
  return json({ rows: await q });
});

const required = new Set(['username', 'fullname', 'password']);

export const POST = requireAdmin(async ({ request }) => {
  const params = getFilteredParams(await request.json(), required);
  if (Object.keys(params).length !== required.size) {
    return jsonError(errors.missing);
  }
  ensureNfcParams(params, nfc);
  params.password = knex.raw("pgcrypto.crypt(?, pgcrypto.gen_salt('md5'))", params.password);
  try {
    const rows = await knex.transaction((trx) =>
      trx('usr')
      .returning('id')
      .insert(params)
    );
    return json({ id: rows[0].id });
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
