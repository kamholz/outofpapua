<script>
  import KeepOnscreen from '$components/KeepOnscreen.svelte';
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
  <KeepOnscreen location="left" let:offscreen>
    <div class="left" class:offscreen>
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
  </KeepOnscreen>
  <KeepOnscreen location="right" let:offscreen>
    <div class="right" class:offscreen>
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
  </KeepOnscreen>
</div>

<style lang="scss">
  .controls {
    display: flex;
    justify-content: space-between;

    .left {
      @include button-left;

      &.offscreen button:last-child {
        margin: 0;
      }
    }

    .right {
      @include button-right;

      &.offscreen button:first-child {
        margin: 0;
      }
    }
  }
</style>
