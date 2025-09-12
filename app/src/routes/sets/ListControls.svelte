<script>
  import KeepOnscreen from '$components/KeepOnscreen.svelte';
  import { getContext } from 'svelte';
  import { pageLoading } from '$lib/stores';

  let {
    collapseAll,
    handleAutocompare,
    handleMap,
    handleMerge,
    selection
  } = $props();
  const editable = getContext('editable');
</script>

<div class="controls">
  <KeepOnscreen location="left" >
    {#snippet children({ offscreen })}
        <div class="left" class:offscreen>
        <button type="button" onclick={() => collapseAll(true)}>Collapse All</button>
        <button type="button" onclick={() => collapseAll(false)}>Expand All</button>
        {#if editable}
          <button
            type="button"
            disabled={$pageLoading || selection.size < 2}
            onclick={handleMerge}
          >Merge Selected Sets</button>
        {/if}
      </div>
          {/snippet}
    </KeepOnscreen>
  <KeepOnscreen location="right" >
    {#snippet children({ offscreen })}
        <div class="right" class:offscreen>
        <button
          type="button"
          disabled={$pageLoading || selection.size < 1}
          onclick={() => handleAutocompare('cog')}
        >Export Cog</button>
        <button
          type="button"
          disabled={$pageLoading || selection.size < 2}
          onclick={handleMap}
        >Map Selected Sets</button>
      </div>
          {/snippet}
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
