import { error } from '@sveltejs/kit';
import { normalizeQuery, serializeQuery } from '$lib/util';

export async function load({ fetch, url: { searchParams } }) {
  const data = {};

  const json = await reload(fetch, normalizeQuery(searchParams));
  if (!json) {
    throw error(500);
  }
  Object.assign(data, json);

  return data;
}

export async function reload(fetch, query) {
  const res = await fetch('/api/language' + serializeQuery({ ...query, details: 1 }));
  return res.ok ? res.json() : null;
}
