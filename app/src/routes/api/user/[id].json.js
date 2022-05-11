import errors from '$lib/errors';
import { adminNotSelf, adminOrSelf, ensureNfcParams, getFilteredParams } from '$lib/util';
import { getUser, requireAuth } from '$lib/auth';
import { knex, sendPgError } from '$lib/db';
import { nfc } from './_params';

const allowed = new Set(['username', 'fullname', 'admin']);

export const get = requireAuth(async ({ params }) => {
  const user = await getUser(params.id);
  if (user) {
    return { body: user };
  } else {
    return { status: 404, body: '' };
  }
});

export const put = requireAuth(async ({ locals, params, request }) => {
  const { user } = locals;
  if (!adminOrSelf(user, params.id)) {
    return { status: 401 };
  }
  const updateParams = getFilteredParams(await request.json(), allowed);
  if ('admin' in updateParams && !adminNotSelf(user, params.id)) {
    return { status: 401 };
  }
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noUpdatable } };
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
      return { body: '' };
    }
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});

export const del = requireAuth(async ({ locals, params }) => {
  const { user } = locals;
  if (!adminNotSelf(user, params.id)) {
    return { status: 401 };
  }
  try {
    const rows = await knex.transaction((trx) =>
      trx('usr')
      .where('id', params.id)
      .returning('id')
      .del()
    );
    return { body: { deleted: rows.length } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
