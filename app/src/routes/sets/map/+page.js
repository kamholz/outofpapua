import ipaConversionFunctions from '$actions/ipa_conversion_functions';
import { error } from '@sveltejs/kit';

export async function load({ fetch, url: { searchParams } }) {
  const data = {};
  let res = await fetch('/api/set/multiple?' + new URLSearchParams({
    ids: searchParams.get('sets'),
  }));
  if (!res.ok) {
    throw error(500);
  }
  data.sets = (await res.json()).rows;
  data.ipaFunctions = await ipaConversionFunctions(fetch, [].concat(...data.sets.map((set) => set.members)));

  if (searchParams.has('id')) {
    res = await fetch(`/api/saved_map/${searchParams.get('id')}`);
    if (!res.ok) {
      throw error(500);
    }
    const { name, mapData } = await res.json();
    data.name = name;
    data.settings = mapData.settings;
  }

  return data;
}

export const ssr = false;
