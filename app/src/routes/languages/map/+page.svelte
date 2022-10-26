<script>
  import LanguageMap from '$components/LanguageMap.svelte';

  export let languages;
</script>

<svelte:head>
  <title>Language map | Out of Papua</title>
</svelte:head>

<h2>Language map</h2>
<LanguageMap {languages} />
