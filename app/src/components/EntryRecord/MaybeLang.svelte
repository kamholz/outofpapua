<script>
  import { getContext } from 'svelte';

  let { lang } = $props();
  const preferences = getContext('preferences');
</script>

{#if $preferences?.showGlossLang}
  <span class="lang">({lang})</span>
{/if}
