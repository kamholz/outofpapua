<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { pageLoading } from '$stores';
</script>

<div>
  <button on:click={() => dispatch('clear')} disabled={$pageLoading}>
    Select None
  </button>
  <button on:click={() => dispatch('link')} disabled={$pageLoading}>
    Link Selected
  </button>
</div>