import errors from '$lib/errors';
import { checkUserPassword, requireAuth } from '$lib/auth';
import { error } from '@sveltejs/kit';
import { jsonError } from '$lib/util';
import { knex, pgError } from '$lib/db';

export const PUT = requireAuth(async ({ locals, params, request }) => {
  const { user } = locals;
  // eslint-disable-next-line eqeqeq
  if (!user.admin && user.id != params.id) { // only admins can modify other user's password
    throw error(401);
  }
  const body = await request.json();
  if (!('new_password' in body) ||
    // eslint-disable-next-line eqeqeq
    ('current_password' in body === (user.admin && user.id != params.id)) // opposite of logical xor
  ) {
    return jsonError(errors.missing);
  }
  if ('current_password' in body && !(await checkUserPassword(user.username, body.current_password))) {
    return jsonError('current password is incorrect');
  }
  try {
    const rows = await knex.transaction((trx) =>
      trx('usr')
      .where('id', params.id)
      .returning('id')
      .update({ password: knex.raw("pgcrypto.crypt(?, pgcrypto.gen_salt('md5'))", body.new_password) })
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
