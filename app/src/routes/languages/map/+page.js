import { error } from '@sveltejs/kit';

export async function load({ fetch }) {
  const data = {};
  const res = await fetch('/api/language?category=location');
  if (!res.ok) {
    throw error(500);
  }
  data.languages = (await res.json()).rows;

  return data;
}

export const ssr = false;
