import errors from '$lib/errors';
import { adminNotSelf, adminOrSelf, ensureNfcParams, getFilteredParams, validateParams } from '$lib/util';
import { getUser, requireAuth } from '$lib/auth';
import { nfc } from './_params';
import { sendPgError, transaction } from '$lib/db';

const allowed = new Set(['username', 'fullname', 'admin']);

export const get = validateParams(requireAuth(async ({ params }) => {
  const user = await getUser(params.id);
  if (user) {
    return { body: user };
  } else {
    return { status: 404, body: '' };
  }
}));

export const put = validateParams(requireAuth(async ({ body, locals, params }) => {
  const { user } = locals;
  if (!adminOrSelf(user, params.id)) {
    return { status: 401 };
  }
  const updateParams = getFilteredParams(body, allowed);
  if ('admin' in updateParams && !adminNotSelf(user, params.id)) {
    return { status: 401 };
  }
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noUpdatable } };
  }
  ensureNfcParams(params, nfc);
  try {
    const ids = await transaction(locals, (trx) =>
      trx('usr')
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
}));

export const del = validateParams(requireAuth(async ({ locals, params }) => {
  const { user } = locals;
  if (!adminNotSelf(user, params.id)) {
    return { status: 401 };
  }
  try {
    const ids = await transaction(locals, (trx) =>
      trx('usr')
      .where('id', Number(params.id))
      .returning('id')
      .del()
    );
    return { body: { deleted: ids.length } };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
}));
