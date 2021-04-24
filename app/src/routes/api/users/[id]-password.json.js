import knex from '$lib/knex';
import { requireAuth, checkUserPassword } from '$lib/auth';
import { getParams } from '$lib/util';

export const post = requireAuth(async ({ params, body, context }) => {
  const { user } = context;
  body = getParams(body);
  if (!('new_password' in body) ||
    (!user.admin && user.id != params.id) || // only admins can modify other user's password
    ('current_password' in body === (user.admin && user.id != params.id)) // opposite of logical xor
  ) {
    return { status: 400 };
  }
  if ('current_password' in body && !(await checkUserPassword(user.username, body.current_password))) {
    return { status: 400, body: { error: 'Current password is incorrect' } };
  }
  const ids = await knex('usr')
    .where('id', params.id)
    .returning('id')
    .update({ password: knex.raw("pgcrypto.crypt(?, pgcrypto.gen_salt('md5'))", body.new_password) });
  return ids.length ? { status: 200, body: "" } : { status: 404 };
});
