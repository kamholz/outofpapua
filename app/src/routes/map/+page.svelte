<script>
  import SetMap from '$components/SetMap.svelte';
  import { setContext } from 'svelte';

  export let data;
  $: ({
    entries,
    name,
    settings,
  } = data);
  const { ipaFunctions } = data;
  setContext('ipaFunctions', ipaFunctions);
</script>

<svelte:head>
  <title>Map from search results | Out of Papua</title>
</svelte:head>

<h2>Map from search results</h2>
<SetMap {...settings} {name} {entries} />
