import knex from '$lib/knex';
import { requireAuth } from '$lib/auth';

export const post = requireAuth(async ({ params, body, context }) => {
  const { user } = context;
  if (
    !body.has('new') ||
    (!user.admin && (user.id !== params.id || !body.has('current')))
  ) {
    return { status: 400 };
  }
  if (!user.admin && !(await auth.checkUserPassword(user.username, body.get('current')))) {
    return { status: 400 };
  }

  try {
    await knex('usr')
      .where('id', params.id)
      .update({ password: knex.raw("pgcrypto.crypt(?, gen_salt('md5'))", body.get('new')) });
  } catch (e) {
    console.log(e);
    return { status: 500 };
  }
  return { status: 200, body: "" };
});
