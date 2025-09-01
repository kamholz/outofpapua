<script>
  import { createEventDispatcher, getContext } from 'svelte';
  const dispatch = createEventDispatcher();
  import { pageLoading } from '$lib/stores';

  export let linkable;
  const selection = getContext('selection');
  $: disabled1 = $pageLoading || $selection.size === 0;
  $: disabled2 = $pageLoading || $selection.size < 2;
</script>

<div>
  <button type="button" on:click={() => dispatch('clear')} disabled={disabled1}>
    Select None
  </button>
  <button type="button" on:click={() => dispatch('map')} disabled={disabled1}>
    Map Selected
  </button>
  {#if linkable}
    <button type="button" on:click={() => dispatch('link')} disabled={disabled2}>
      Link Selected
    </button>
  {/if}
</div>

<style lang="scss">
  @include button-right;
</style>
