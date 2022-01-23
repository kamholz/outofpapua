import Ajv from 'ajv';
import { knex, sendPgError } from '$lib/db';
import { requireAuth } from '$lib/auth';
import { schema } from '$lib/preferences';

const ajv = new Ajv();
const validate = ajv.compile(schema);

export const put = requireAuth(async ({ locals, request }) => {
  const body = await request.json();
  if (!validate(body)) {
    return { status: 400, body: { error: 'invalid preferences object' } };
  }
  try {
    await knex('usr')
      .where('id', locals.user.id)
      .update({ preferences: knex.raw("coalesce(preferences, '{}'::jsonb) || ?", [body]) });
    return { body: '' };
  } catch (e) {
    console.log(e);
    return sendPgError(e);
  }
});
