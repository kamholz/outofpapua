<script>
  import KeepOnscreen from '$components/KeepOnscreen.svelte';
  import { createEventDispatcher, getContext } from 'svelte';
  const dispatch = createEventDispatcher();
  import { pageLoading } from '$lib/stores';

  let { linkable } = $props();
  const selection = getContext('selection');
  let disabled1 = $derived($pageLoading || $selection.size === 0);
  let disabled2 = $derived($pageLoading || $selection.size < 2);
</script>

<KeepOnscreen >
  {#snippet children({ offscreen })}
    <div class:offscreen>
      <button type="button" onclick={() => dispatch('clear')} disabled={disabled1}>
        Select None
      </button>
      <button type="button" onclick={() => dispatch('map')} disabled={disabled1}>
        Map Selected
      </button>
      {#if linkable}
        <button type="button" onclick={() => dispatch('link')} disabled={disabled2}>
          Link Selected
        </button>
      {/if}
    </div>
  {/snippet}
</KeepOnscreen>

<style lang="scss">
  @include button-right;

  .offscreen button:first-child {
    margin: 0;
  }
</style>
