<script context="module">
  import ipaConversionFunctions from '$actions/ipa_conversion_functions';

  export const ssr = false;

  export async function load({ fetch, page: { query } }) {
    const props = {};
    const res = await fetch('/api/set/multiple.json?' + new URLSearchParams({
      ids: query.get('sets'),
    }));
    if (!res.ok) {
      return { status: 500 };
    }
    props.sets = (await res.json()).rows;
    props.members = [].concat(...props.sets.map((set) => set.members.map((member) => ({ ...member, set_id: set.id }))));
    props.ipaFunctions = await ipaConversionFunctions(fetch, props.members);
    return { props };
  }
</script>

<script>
  import SetMap from '$components/SetMap.svelte';
  import { setContext } from 'svelte';

  export let sets;
  export let members;
  export let ipaFunctions;
  setContext('ipaFunctions', ipaFunctions);
</script>

<h2>Map from search results</h2>
<SetMap {members} {sets} />
