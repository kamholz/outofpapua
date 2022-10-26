import { error } from '@sveltejs/kit';
import { requireAuthLoad } from '$actions/auth';

export const load = requireAuthLoad(async ({ fetch }) => {
  const json = await reload(fetch);
  if (!json) {
    throw error(500);
  }
  return {
    rows: json.rows,
  };
});

export async function reload(fetch) {
  const res = await fetch('/api/user');
  return res.ok ? res.json() : null;
}
