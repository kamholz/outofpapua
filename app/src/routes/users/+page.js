import { error } from '@sveltejs/kit';
import { requireAuthLoad } from '$actions/auth';

export const load = requireAuthLoad(async ({ fetch }) => {
  const res = await fetch('/api/user');
  if (!res.ok) {
    throw error(500);
  }
  const json = await res.json();

  return {
    rows: json.rows,
  };
});
