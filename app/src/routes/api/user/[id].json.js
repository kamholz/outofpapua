import errors from '$lib/errors';
import { adminNotSelf, adminOrSelf, ensureNfcParams, getFilteredParams } from '$lib/util';
import { getUser, requireAuth } from '$lib/auth';
import { nfc, table } from './_params';
import { sendPgError, transaction } from '$lib/db';

const allowed = new Set(['username', 'fullname', 'admin']);

export const get = requireAuth(async ({ params }) => {
  const user = await getUser(params.id);
  if (user) {
    return { body: user };
  }
});

export const put = requireAuth(async ({ body, context, params }) => {
  const { user } = context;
  if (!adminOrSelf(user, params.id)) {
    return { status: 401 };
  }
  const updateParams = getFilteredParams(body, allowed);
  if ('admin' in updateParams && !adminNotSelf(user, params.id)) {
    return { status: 401 };
  }
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.no_updatable } };
  }
  ensureNfcParams(params, nfc);
  try {
    const ids = await transaction(context, (trx) =>
      trx(table)
      .where('id', Number(params.id))
      .returning('id')
      .update(updateParams)
    );
    if (ids.length) {
      return { body: '' };
    }
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});

export const del = requireAuth(async ({ context, params }) => {
  const { user } = context;
  if (!adminNotSelf(user, params.id)) {
    return { status: 401 };
  }
  try {
    const ids = await transaction(context, (trx) =>
      trx(table)
      .where('id', Number(params.id))
      .returning('id')
      .del()
    );
    return { body: { deleted: ids.length } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
