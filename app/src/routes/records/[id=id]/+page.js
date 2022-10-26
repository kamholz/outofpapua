import { error } from '@sveltejs/kit';

export async function load({ fetch, params }) {
  const data = {};
  const res = await fetch(`/api/record/${params.id}`);
  if (!res.ok) {
    throw error(404);
  }
  data.record = await res.json();
  return data;
}
