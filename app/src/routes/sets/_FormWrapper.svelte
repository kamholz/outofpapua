<script>
  import Collapsible from '$components/Collapsible.svelte';
  import CollapsibleIndicator from '$components/CollapsibleIndicator.svelte';
  import { slide } from 'svelte/transition';

  export let collapsed;
  export let label;
  let toggle;
</script>

<Collapsible {collapsed} bind:toggle>
  <div slot="collapsed" class="set-item collapsed">
    <CollapsibleIndicator />
    <div class="set-item-label clickable" on:click={toggle}>{label}</div>
  </div>
  <div slot="expanded" class="set-item" transition:slide={{ duration: 200 }}>
    <CollapsibleIndicator />
    <div class="form">
      <div class="form-label clickable" on:click={toggle}>{label}</div>
      <slot />
    </div>
  </div>
</Collapsible>

<style>
  .clickable {
    cursor: default;
  }
</style>