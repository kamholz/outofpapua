<script context="module">
  import ipaConversionFunctions from '$actions/ipa_conversion_functions';

  export const ssr = false;

  export async function load({ fetch, url: { searchParams } }) {
    const props = {};
    let res = await fetch('/api/entry/multiple.json?' + new URLSearchParams({
      ids: searchParams.get('entries'),
    }));
    if (!res.ok) {
      return { status: 500 };
    }
    props.entries = (await res.json()).rows;
    props.ipaFunctions = await ipaConversionFunctions(fetch, props.entries);

    if (searchParams.has('id')) {
      res = await fetch(`/api/saved_map/${searchParams.get('id')}.json`);
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

  export let entries;
  export let name = null;
  export let settings = {};
  export let ipaFunctions;
  setContext('ipaFunctions', ipaFunctions);
</script>

<svelte:head>
  <title>Map from search results | Out of Papua</title>
</svelte:head>

<h2>Map from search results</h2>
<SetMap {...settings} {name} {entries} />
