import Ajv from 'ajv';
import { jsonError } from '$lib/util';
import { knex, pgError } from '$lib/db';
import { requireAuth } from '$lib/auth';
import { schema } from '$lib/preferences';

const ajv = new Ajv();
const validate = ajv.compile(schema);

export const PUT = requireAuth(async ({ locals, request }) => {
  const body = await request.json();
  if (!validate(body)) {
    return jsonError('invalid preferences object');
  }
  try {
    await knex('usr')
      .where('id', locals.user.id)
      .update({ preferences: knex.raw("coalesce(preferences, '{}'::jsonb) || ?", [body]) });
    return new Response(null);
  } catch (e) {
    console.log(e);
    return pgError(e);
  }
});
