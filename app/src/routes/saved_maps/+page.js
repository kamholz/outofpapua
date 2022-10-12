import { error } from '@sveltejs/kit';
import { requireAuthLoad } from '$actions/auth';

export const load = requireAuthLoad(async ({ fetch }) => {
  const data = {};
  const res = await fetch('/api/saved_map');
  if (!res.ok) {
    throw error(500);
  }
  const json = await res.json();
  Object.assign(data, json);

  return data;
});
