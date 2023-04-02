import { json } from '@sveltejs/kit';
import { knex } from '$lib/db';

export async function GET() {
  const q = knex('region')
    .select('name')
    .orderBy('name');

  return json({
    rows: await q,
  });
}
