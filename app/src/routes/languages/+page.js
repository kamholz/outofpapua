import { error } from '@sveltejs/kit';
import { normalizeQuery, serializeQuery } from '$lib/util';

export async function load({ fetch, url: { searchParams } }) {
  const data = {};

  const res = await fetch('/api/language' + serializeQuery({ ...normalizeQuery(searchParams), details: 1 }));
  if (!res.ok) {
    throw error(500);
  }
  const json = await res.json();
  Object.assign(data, json);

  return data;
}
