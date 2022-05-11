import errors from '$lib/errors';
import { ensureNfcParams, getFilteredParams } from '$lib/util';
import { knex, sendPgError } from '$lib/db';
import { nfc } from './_params';
import { requireAdmin, requireAuth } from '$lib/auth';

export const get = requireAuth(async () => {
  const q = knex('usr')
    .select('id', 'username', 'fullname', 'admin')
    .orderBy('fullname');
  return {
    body: {
      rows: await q,
    },
  };
});

const required = new Set(['username', 'fullname', 'password']);

export const post = requireAdmin(async ({ request }) => {
  const params = getFilteredParams(await request.json(), required);
  if (Object.keys(params).length !== required.size) {
    return { status: 400, body: { error: errors.missing } };
  }
  ensureNfcParams(params, nfc);
  params.password = knex.raw("pgcrypto.crypt(?, pgcrypto.gen_salt('md5'))", params.password);
  try {
    const rows = await knex.transaction((trx) =>
      trx('usr')
      .returning('id')
      .insert(params)
    );
    return { body: { id: rows[0].id } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
