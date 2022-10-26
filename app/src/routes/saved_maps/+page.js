import { error } from '@sveltejs/kit'; 
import { requireAuthLoad } from '$actions/auth';

export const load = requireAuthLoad(async ({ fetch }) => {
  const data = {};
  const json = await reload(fetch);
  if (!json) {
    throw error(500);
  }
  Object.assign(data, json);

  return data;
});

export async function reload(fetch) {
  const res = await fetch('/api/saved_map');
  return res.ok ? res.json() : null;
}
