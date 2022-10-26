import { error, redirect } from '@sveltejs/kit';
import { serializeArrayParam } from '$lib/util';

export async function load({ fetch, params }) {
  const res = await fetch(`/api/saved_map/${params.id}`);
  if (!res.ok) {
    throw error(500);
  }
  const { id, data: { sets, entries } } = await res.json();

  if (sets) {
    if (sets?.length === 1) {
      throw redirect(302, `/sets/${sets[0]}/map?id=${id}`);
    } else {
      throw redirect(302, `/sets/map?id=${id}&sets=${serializeArrayParam(sets)}`);
    }
  } else if (entries) {
    throw redirect(302, `/map?id=${id}&entries=${serializeArrayParam(entries)}`);
  } else {
    throw error(404);
  }
}
