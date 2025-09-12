<script>
  import { run } from 'svelte/legacy';

  import { getPreferences } from '$lib/stores';
  import { isContributor } from '$lib/util';
  import { setContext } from 'svelte';

  let { session, children } = $props();
  run(() => {
    if (session) {
      setContext('editable', isContributor(session.user));
      setContext('preferences', getPreferences(session));
    }
  });
</script>

{@render children?.()}
