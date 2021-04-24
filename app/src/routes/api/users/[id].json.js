import knex from '$lib/knex';
import { requireAuth, getUser } from '$lib/auth';
import { getFilteredParams, adminOrSelf, adminNotSelf } from '$lib/util';

const updatable = new Set(['username','fullname','admin']);

export const get = requireAuth(async ({ params }) => {
  const user = await getUser(params.id);
  return user ? { body: user } : { status: 404 };
});

export const put = requireAuth(async ({ params, body, context }) => {
  const { user } = context;
  if (!adminOrSelf(user, params.id)) {
    return { status: 401 };
  }
  const toUpdate = getFilteredParams(body, updatable);
  if ('admin' in toUpdate && !adminNotSelf(user, params.id)) {
    return { status: 401 };
  }
  if (!Object.keys(toUpdate).length) {
    return { status: 400 };
  }
  const ids = await knex('usr')
    .where('id', params.id)
    .returning('id')
    .update(toUpdate);
  return ids.length ? { status: 200, body: "" } : { status: 404 };
});

export const del = requireAuth(async ({ params, context }) => {
  const { user } = context;
  if (!adminNotSelf(user, params.id)) {
    return { status: 401 };
  }
  const ids = await knex('usr')
    .where('id', params.id)
    .returning('id')
    .del();
  return ids.length ? { status: 200, body: "" } : { status: 404 };
});