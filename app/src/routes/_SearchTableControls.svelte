<script>
  import { createEventDispatcher, getContext } from 'svelte';
  const dispatch = createEventDispatcher();
  import { pageLoading } from '$stores';

  const selection = getContext('selection');
  $: emptySelection = !Object.keys($selection).length;
</script>

<div>
  <button on:click={() => dispatch('clear')} disabled={$pageLoading || emptySelection}>
    Select None
  </button>
  <button on:click={() => dispatch('link')} disabled={$pageLoading || emptySelection}>
    Link Selected
  </button>
</div>