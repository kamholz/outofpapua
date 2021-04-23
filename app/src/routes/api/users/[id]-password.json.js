import knex from '$lib/knex';
import { requireAuth, checkUserPassword } from '$lib/auth';

export const post = requireAuth(async ({ params, body, context }) => {
  const { user } = context;
  if (!body) {
    return { status: 400 };
  }
  if (
    !body.has('new_pass') ||
    (!user.admin && (user.id !== params.id || !body.has('current_pass')))
  ) {
    return { status: 400 };
  }
  if (body.has('current_pass') && !(await checkUserPassword(user.username, body.get('current_pass')))) {
    return { status: 400, body: { error: 'current password is incorrect' } };
  }

  try {
    await knex('usr')
      .where('id', params.id)
      .update({ password: knex.raw("pgcrypto.crypt(?, pgcrypto.gen_salt('md5'))", body.get('new_pass')) });
  } catch (e) {
    console.log(e);
    return { status: 500 };
  }
  return { status: 200, body: "" };
});
