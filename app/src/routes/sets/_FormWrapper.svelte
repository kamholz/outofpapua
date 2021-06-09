<script>
  import Collapsible from '$components/Collapsible.svelte';
  import CollapsibleIndicator from '$components/CollapsibleIndicator.svelte';
  import { slide } from 'svelte/transition';

  export let collapsed;
  export let label;
  let toggle;
</script>

<Collapsible {collapsed} bind:toggle>
  <div class="set-item">
    <CollapsibleIndicator />
    <div class="set-item-label clickable fullwidth" on:click={toggle}>{label}</div>
  </div>
  {#if !$collapsed}
    <div class="form" transition:slide={{ duration: 200 }}>
      <slot />
    </div>
  {/if}
</Collapsible>

<style lang="scss">
  .clickable {
    cursor: default;
  }

  .form {
    margin-block-start: 12px;
  }
</style>