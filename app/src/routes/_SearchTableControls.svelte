<script>
  import { createEventDispatcher, getContext } from 'svelte';
  const dispatch = createEventDispatcher();
  import { pageLoading } from '$lib/stores';

  const selection = getContext('selection');
  $: disabled = $pageLoading || Object.keys($selection).length < 2;
</script>

<div>
  <button on:click={() => dispatch('clear')} {disabled}>
    Select None
  </button>
  <button on:click={() => dispatch('link')} {disabled}>
    Link Selected
  </button>
</div>