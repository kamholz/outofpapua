<script context="module">
  import ipaConversionFunctions from '$actions/ipa_conversion_functions';

  export async function load({ fetch, params, url: { searchParams } }) {
    const props = {};

    let res = await fetch(`/api/set/${params.id}.json`);
    if (!res.ok) {
      return { status: 404 };
    }
    props.set = await res.json();
    props.ipaFunctions = await ipaConversionFunctions(fetch, props.set.members);

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

  export let set;
  export let name = null;
  export let settings = {};
  export let ipaFunctions;
  setContext('ipaFunctions', ipaFunctions);
</script>

<svelte:head>
  <title>Set map: {set.name_auto.txt} | Out of Papua</title>
</svelte:head>

<h2>Set map: {set.name_auto.txt}</h2>
<SetMap {...settings} {name} sets={[set]} />
