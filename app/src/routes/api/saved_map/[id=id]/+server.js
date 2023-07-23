import { allowed } from '../params';
import { error, json } from '@sveltejs/kit';
import { errorStrings, jsonError } from '$lib/error';
import { getFilteredParams } from '$lib/util';
import { knex, pgError } from '$lib/db';
import { requireAuth } from '$lib/auth';

export const GET = requireAuth(async ({ params }) => {
  const q = knex('saved_map')
    .where('saved_map.id', params.id)
    .first(
      'saved_map.id',
      'saved_map.data',
      'saved_map.name'
    );
  const row = await q;
  if (row) {
    return json(row);
  } else {
    throw error(404);
  }
});

export const PUT = requireAuth(async ({ params, request }) => {
  const updateParams = getFilteredParams(await request.json(), allowed);
  if (!Object.keys(updateParams).length) {
    return jsonError(errorStrings.noUpdatable);
  }
  try {
    const rows = await knex.transaction((trx) =>
      trx('saved_map')
      .where('id', params.id)
      .returning('id')
      .update(updateParams)
    );
    if (rows.length) {
      return new Response(null);
    } else {
      throw error(404);
    }
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});

export const DELETE = requireAuth(async ({ params }) => {
  try {
    const rows = await knex.transaction((trx) =>
      trx('saved_map')
      .where('id', params.id)
      .returning('id')
      .del()
    );
    return json({ deleted: rows.length });
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
