<script>
  import { getContext } from 'svelte';
  import { pageLoading } from '$lib/stores';

  export let collapseAll;
  export let handleAutocompare;
  export let handleMap;
  export let handleMerge;
  export let selection;
  const editable = getContext('editable');
</script>

<div class="controls">
  <div>
    <button type="button" on:click={() => collapseAll(true)}>Collapse All</button>
    <button type="button" on:click={() => collapseAll(false)}>Expand All</button>
    {#if editable}
      <button
        type="button"
        disabled={$pageLoading || selection.size < 2}
        on:click={handleMerge}
      >Merge Selected Sets</button>
    {/if}
  </div>
  <div>
    <button
      type="button"
      disabled={$pageLoading || selection.size < 1}
      on:click={() => handleAutocompare('cog')}
    >Export Cog</button>
    <button
      type="button"
      disabled={$pageLoading || selection.size < 2}
      on:click={handleMap}
    >Map Selected Sets</button>
  </div>
</div>

<style lang="scss">
  .controls {
    display: flex;
    justify-content: space-between;

    :first-child {
      @include button-left;
    }

    :last-child {
      @include button-right;
    }
  }
</style>
