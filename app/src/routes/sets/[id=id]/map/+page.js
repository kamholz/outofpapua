import ipaConversionFunctions from '$actions/ipa_conversion_functions';
import { error } from '@sveltejs/kit';

export async function load({ fetch, params, url: { searchParams } }) {
  const data = {};

  let res = await fetch(`/api/set/${params.id}`);
  if (!res.ok) {
    throw error(404);
  }
  data.set = await res.json();
  data.ipaFunctions = await ipaConversionFunctions(fetch, data.set.members);

  if (searchParams.has('id')) {
    res = await fetch(`/api/saved_map/${searchParams.get('id')}`);
    if (!res.ok) {
      throw error(500);
    }
    const { name, data: mapData } = await res.json();
    data.name = name;
    data.settings = mapData.settings;
  }

  return data;
}

export const ssr = false;
