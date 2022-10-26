import errors from '$lib/errors';
import { allowed, required } from './params';
import { getFilteredParams, jsonError } from '$lib/util';
import { json } from '@sveltejs/kit';
import { knex, pgError } from '$lib/db';
import { requireAuth } from '$lib/auth';

export const GET = requireAuth(async ({ locals }) => {
  const q = knex('saved_map')
    .where('saved_map.usr_id', locals.user.id)
    .select(
      'saved_map.id',
      'saved_map.name'
    )
    .orderBy('saved_map.name');

  return json({ rows: await q });
});

export const POST = requireAuth(async ({ locals, request }) => {
  const params = getFilteredParams(await request.json(), allowed);
  if (Object.keys(getFilteredParams(params, required)).length !== required.size) {
    return jsonError(errors.missing);
  }
  params.usr_id = locals.user.id;
  try {
    const rows = await knex.transaction((trx) =>
      trx('saved_map')
      .returning('id')
      .insert(params)
      .onConflict(['usr_id', 'name'])
      .merge()
    );
    return json({ id: rows[0].id });
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
