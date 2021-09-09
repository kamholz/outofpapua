import { knex } from '$lib/db';

export async function get({ locals }) {
  const q = knex('usr')
    .whereExists(function () {
      this.select('*').from('set').where('author_id', knex.ref('usr.id'));
    })
    .select('id');
  if (locals.user) {
    const { id } = locals.user;
    q
      .select(knex.raw("case when id = ? then 'me' else fullname end", id))
      .orderBy(knex.raw('id != ?', id))
      .orderBy('fullname');
  } else {
    q
      .select('fullname')
      .orderBy('fullname');
  }

  return {
    body: {
      rows: await q,
    },
  };
};