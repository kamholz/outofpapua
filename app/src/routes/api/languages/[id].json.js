import knex from '$lib/knex';
import { requireAuth } from '$lib/auth';

export const post = requireAuth(async ({ params, body }) => {
  console.log(params);
  console.log(body);
  return {
    body: "foo"
  }
});
