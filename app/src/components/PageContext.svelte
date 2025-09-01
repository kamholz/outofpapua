<script>
  import { getPreferences } from '$lib/stores';
  import { isContributor } from '$lib/util';
  import { setContext } from 'svelte';

  export let session;
  $: if (session) {
    setContext('editable', isContributor(session.user));
    setContext('preferences', getPreferences(session));
  }
</script>

<slot />
