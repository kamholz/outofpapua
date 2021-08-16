<script>
  import { createEventDispatcher, getContext } from 'svelte';
  const dispatch = createEventDispatcher();
  import { pageLoading } from '$lib/stores';

  const selection = getContext('selection');
  $: disabled = $pageLoading || Object.keys($selection).length < 2;
</script>

<div>
  <button type="button" on:click={() => dispatch('clear')} {disabled}>
    Select None
  </button>
  <button type="button" on:click={() => dispatch('link')} {disabled}>
    Link Selected
  </button>
</div>

<style lang="scss">
  @include button-right;
</style>