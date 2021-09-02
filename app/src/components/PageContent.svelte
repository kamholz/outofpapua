<script>
  import { getPreferences } from '$lib/stores';
  import { setContext } from 'svelte';
  setContext('preferences', getPreferences());
</script>

<slot />