<script context="module">
  import ipaConversionFunctions from '$actions/ipa_conversion_functions';

  export const ssr = false;

  export async function load({ fetch, page: { query } }) {
    const props = {};
    let res = await fetch('/api/set/multiple.json?' + new URLSearchParams({
      ids: query.get('sets'),
    }));
    if (!res.ok) {
      return { status: 500 };
    }
    props.sets = (await res.json()).rows;
    props.ipaFunctions = await ipaConversionFunctions(fetch, [].concat(...props.sets.map((set) => set.members)));

    if (query.has('id')) {
      res = await fetch(`/api/saved_map/${query.get('id')}.json`);
      if (!res.ok) {
        return { status: 500 };
      }
      const { name, data } = await res.json();
      props.name = name;
      props.settings = data.settings;
    }

    return { props };
  }
</script>

<script>
  import SetMap from '$components/SetMap.svelte';
  import { setContext } from 'svelte';

  export let sets;
  export let name = null;
  export let settings = {};
  export let ipaFunctions;
  setContext('ipaFunctions', ipaFunctions);
</script>

<svelte:head>
  <title>Set map | Out of Papua</title>
</svelte:head>

<h2>Set map</h2>
<SetMap {...settings} {name} {sets} />
