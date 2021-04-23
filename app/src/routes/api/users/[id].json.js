import knex from '$lib/knex';
import { requireAuth, getUser } from '$lib/auth';
import { filteredParams, adminOrSelf, adminNotSelf } from '$lib/util';

const updatable = new Set(['username','fullname','admin']);

export const get = requireAuth(async ({ params }) => {
  return {
    body: await getUser(params.id)
  };
});

export const post = requireAuth(async ({ params, body, context }) => {
  const { user } = context;
  if (!adminOrSelf(user, params.id)) {
    return { status: 401 };
  }
  const toUpdate = filteredParams(body, updatable);
  if ('admin' in toUpdate && !adminNotSelf(user, params.id)) {
    return { status: 401 };
  }
  if (Object.keys(toUpdate).length) {
    try {
      await knex('usr')
        .where('id', params.id)
        .update(toUpdate);
    } catch (e) {
      console.log(e);
      return { status: 500 };
    }
    return { status: 200, body: "" };
  }

  return { status: 400 };
});

export const del = requireAuth(async ({ params, context }) => {
  const { user } = context;
  if (!adminNotSelf(user, params.id)) {
    return { status: 401 };
  }
  try {
    await knex('usr')
      .where('id', params.id)
      .del();
  } catch (e) {
    console.log(e);
    return { status: 500 };
  }
  return { status: 200, body: "" };
});