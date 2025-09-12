<script>
  import CollapseIndicator from '$components/CollapseIndicator.svelte';
  import { slide } from 'svelte/transition';

  let { label, children } = $props();
  let collapsed = $state(true);
  let toggle = $state();
</script>

<div class="set-item">
  <CollapseIndicator bind:collapsed bind:toggle />
  <div class="set-item-label clickable fullwidth" onclick={toggle}>{label}</div>
</div>
{#if !collapsed}
  <div class="section" transition:slide={{ duration: 200 }}>
    {@render children?.()}
  </div>
{/if}

<style lang="scss">
  .clickable {
    cursor: default;
  }

  .section {
    margin-block-start: 12px;
  }
</style>
