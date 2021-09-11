<script context="module">
  import ipaConversionFunctions from '$actions/ipa_conversion_functions';

  export const ssr = false;

  export async function load({ fetch, page: { params } }) {
    const props = {};

    const res = await fetch(`/api/set/${params.id}.json`);
    if (!res.ok) {
      return { status: 404 };
    }
    props.set = await res.json();
    props.ipaFunctions = await ipaConversionFunctions(fetch, props.set.members);

    return { props };
  }
</script>

<script>
  import SetMap from '$components/SetMap.svelte';
  import { setContext } from 'svelte';

  export let set;
  export let ipaFunctions;
  setContext('ipaFunctions', ipaFunctions);
</script>

<h2>Set map: {set.name_auto.txt}</h2>
<SetMap sets={[set]} />
