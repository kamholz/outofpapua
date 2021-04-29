import { knex, sendPgError } from '$lib/db';
import { requireAuth, getUser } from '$lib/auth';
import { getFilteredParams, adminOrSelf, adminNotSelf } from '$lib/util';
import errors from '$lib/errors';

const table = 'usr';
const allowed = new Set(['username', 'fullname', 'admin']);

export const get = requireAuth(async ({ params }) => {
  const user = await getUser(params.id);
  if (user) {
    return { body: user };
  }
});

export const put = requireAuth(async ({ params, body, context }) => {
  const { user } = context;
  if (!adminOrSelf(user, params.id)) {
    return { status: 401 };
  }
  const updateParams = getFilteredParams(body, allowed);
  if ('admin' in updateParams && !adminNotSelf(user, params.id)) {
    return { status: 401 };
  }
  if (!Object.keys(updateParams).length) {
    return { status: 400, body: { error: errors.noupdatable } };
  }
  try {
    const ids = await knex(table)
      .where('id', params.id)
      .returning('id')
      .update(updateParams);
    if (ids.length) {
      return { body: '' };
    }
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});

export const del = requireAuth(async ({ params, context }) => {
  const { user } = context;
  if (!adminNotSelf(user, params.id)) {
    return { status: 401 };
  }
  try {
    const ids = await knex(table)
      .where('id', params.id)
      .returning('id')
      .del();
    if (ids.length) {
      return { body: '' };
    }
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
