import knex from '$lib/knex';
import { requireAuth } from '$lib/auth';
import { filteredParams } from '$lib/util';

const updatable = new Set(['username','fullname','admin']);

export const post = requireAuth(async ({ params, body, context }) => {
  const { user } = context;
  if (!user.admin && user.id !== params.id) {
    return { status: 400 };
  }

  const toUpdate = filteredParams(body, updatable);
  if ('admin' in toUpdate && (!user.admin || user.id === params.id)) {
    return { status: 400 };
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
