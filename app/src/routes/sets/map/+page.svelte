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
