import { json } from '@sveltejs/kit';
import { knex } from '$lib/db';
import { requireComparative } from '$lib/auth';

export const GET = requireComparative(async ({ locals }) => {
  const q = knex('usr')
    .whereExists(function () {
      this.select('*').from('set').where('author_id', knex.ref('usr.id'));
    })
    .select('id');
  if (locals.user) {
    const { id } = locals.user;
    q
      .select(knex.raw("(case when id = ? then 'me' else fullname end) as fullname", id))
      .orderBy(knex.raw('id != ?', id))
      .orderBy('usr.fullname');
  } else {
    q
      .select('fullname')
      .orderBy('fullname');
  }

  return json({ rows: await q });
});
