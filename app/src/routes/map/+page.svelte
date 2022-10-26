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
