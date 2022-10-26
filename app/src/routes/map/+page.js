import ipaConversionFunctions from '$actions/ipa_conversion_functions';
import { error } from '@sveltejs/kit';

export async function load({ fetch, url: { searchParams } }) {
  const data = {};
  let res = await fetch('/api/entry/multiple?' + new URLSearchParams({
    ids: searchParams.get('entries'),
  }));
  if (!res.ok) {
    throw error(500);
  }
  data.entries = (await res.json()).rows;
  data.ipaFunctions = await ipaConversionFunctions(fetch, data.entries);

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
