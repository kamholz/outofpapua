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
