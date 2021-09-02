<script>
  import { getPreferences } from '$lib/stores';
  import { setContext } from 'svelte';

  export let session;
  setContext('editable', Boolean(session.user));
  setContext('preferences', getPreferences(session));
</script>

<slot />