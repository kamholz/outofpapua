import { knex, sendPgError } from '$lib/db';
import { checkUserPassword, requireAuth } from '$lib/auth';
import errors from '$lib/errors';

const table = 'usr';

export const put = requireAuth(async ({ params, body, context }) => {
  const { user } = context;
  if (!user.admin && user.id != params.id) { // only admins can modify other user's password
    return { status: 401 };
  }
  if (!('new_password' in body) ||
    ('current_password' in body === (user.admin && user.id != params.id)) // opposite of logical xor
  ) {
    return { status: 400, body: { error: errors.missing } };
  }
  if ('current_password' in body && !(await checkUserPassword(user.username, body.current_password))) {
    return { status: 400, body: { error: 'current password is incorrect' } };
  }
  try {
    const ids = await knex(table)
      .where('id', params.id)
      .returning('id')
      .update({ password: knex.raw("pgcrypto.crypt(?, pgcrypto.gen_salt('md5'))", body.new_password) });
    if (ids.length) {
      return { body: "" };
    }
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
