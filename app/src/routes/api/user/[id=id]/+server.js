import errors from '$lib/errors';
import { adminNotSelf, adminOrSelf, ensureNfcParams, getFilteredParams, jsonError } from '$lib/util';
import { error, json } from '@sveltejs/kit';
import { getUser, requireAuth } from '$lib/auth';
import { knex, pgError } from '$lib/db';
import { nfc } from '../params';

const allowed = new Set(['username', 'fullname', 'admin']);

export const GET = requireAuth(async ({ params }) => {
  const user = await getUser(params.id);
  if (user) {
    return { body: user };
  } else {
    throw error(404);
  }
});

export const PUT = requireAuth(async ({ locals, params, request }) => {
  const { user } = locals;
  if (!adminOrSelf(user, params.id)) {
    throw error(401);
  }
  const updateParams = getFilteredParams(await request.json(), allowed);
  if ('admin' in updateParams && !adminNotSelf(user, params.id)) {
    throw error(401);
  }
  if (!Object.keys(updateParams).length) {
    return jsonError(errors.noUpdatable);
  }
  ensureNfcParams(params, nfc);
  try {
    const rows = await knex.transaction((trx) =>
      trx('usr')
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

export const DELETE = requireAuth(async ({ locals, params }) => {
  const { user } = locals;
  if (!adminNotSelf(user, params.id)) {
    throw error(401);
  }
  try {
    const rows = await knex.transaction((trx) =>
      trx('usr')
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
