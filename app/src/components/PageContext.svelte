<script>
  import { getPreferences } from '$lib/stores';
  import { setContext } from 'svelte';

  export let data;
  setContext('editable', Boolean(data.user));
  setContext('preferences', getPreferences(data));
</script>

<slot />