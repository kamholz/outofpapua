<script>
  import { createPopperActions, popover } from '$lib/popover';
  import { fade } from 'svelte/transition';
  import { getContext } from 'svelte';
  import { originSummary } from '$lib/util';

  export let entry;
  export let editable;
  const state = getContext('EntryOrigin');

  const [popperRef, popperContent] = createPopperActions();
  let showPopover = false;
  let popoverRef;
</script>

<span
  use:popover={{
    popperRef,
    popoverRef: () => popoverRef,
    activate: 'click',
    show: () => showPopover = true,
    hide: () => showPopover = false,
  }}
>
  <slot />
</span>
{#if showPopover}
  <div class="popover" use:popperContent bind:this={popoverRef} transition:fade|local={{ duration: 200 }}>
    Origin: {originSummary(entry)}
  </div>
{/if}

<style lang="scss">
  .popover {
    padding: 8px;
    @include popover;
  }
</style>