import knex from '$lib/knex';
import { requireAuth, checkUserPassword } from '$lib/auth';
import { getParams } from '$lib/util';

export const post = requireAuth(async ({ params, body, context }) => {
  const { user } = context;
  body = getParams(body);
  if (!('new_pass' in body) ||
    (!user.admin && (user.id !== params.id || !('current_pass' in body)))
  ) {
    return { status: 400 };
  }
  if ('current_pass' in body && !(await checkUserPassword(user.username, body.current_pass))) {
    return { status: 400, body: { error: 'current password is incorrect' } };
  }
  const ids = await knex('usr')
    .where('id', params.id)
    .returning('id')
    .update({ password: knex.raw("pgcrypto.crypt(?, pgcrypto.gen_salt('md5'))", body.new_pass) });
  return ids.length ? { status: 200, body: "" } : { status: 404 };
});
