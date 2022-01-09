<script>
  import { getContext } from 'svelte';

  export let lang;
  const preferences = getContext('preferences');
</script>

{#if $preferences?.showGlossLang}
  <span class="lang">({lang})</span>
{/if}