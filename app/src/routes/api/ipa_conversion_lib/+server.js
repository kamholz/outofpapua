import errors from '$lib/errors';
import { allowed } from './params';
import { getFilteredParams, jsonError } from '$lib/util';
import { json } from '@sveltejs/kit';
import { knex, pgError } from '$lib/db';
import { requireEditor } from '$lib/auth';

export const GET = requireEditor(async () => {
  const q = knex('ipa_conversion_lib as icl')
    .select(
      'icl.name',
      'icl.code'
    )
    .orderBy('icl.name');

  return json({ rows: await q });
});

const required = new Set(['name']);

export const POST = requireEditor(async ({ request }) => {
  const params = getFilteredParams(await request.json(), allowed);
  if (Object.keys(getFilteredParams(params, required)).length !== required.size) {
    return jsonError(errors.missing);
  }
  try {
    const names = await knex.transaction((trx) =>
      trx('ipa_conversion_lib')
      .returning('name')
      .insert(params)
    );
    return json({ name: names[0].name });
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
