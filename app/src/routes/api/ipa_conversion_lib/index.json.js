import errors from '$lib/errors';
import { allowed } from './_params';
import { getFilteredParams } from '$lib/util';
import { knex, sendPgError } from '$lib/db';
import { requireAdmin } from '$lib/auth';

export const get = requireAdmin(async () => {
  const q = knex('ipa_conversion_lib as icl')
    .select(
      'icl.name',
      'icl.code'
    )
    .orderBy('icl.name');

  return {
    body: {
      rows: await q,
    },
  };
});

const required = new Set(['name']);

export const post = requireAdmin(async ({ request }) => {
  const params = getFilteredParams(await request.json(), allowed);
  if (Object.keys(getFilteredParams(params, required)).length !== required.size) {
    return { status: 400, body: { error: errors.missing } };
  }
  try {
    const names = await knex.transaction((trx) =>
      trx('ipa_conversion_lib')
      .returning('name')
      .insert(params)
    );
    return { body: { name: names[0] } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
