<script>
  import CollapseIndicator from '$components/CollapseIndicator.svelte';
  import { slide } from 'svelte/transition';

  export let label;
  let collapsed = true;
  let toggle;
</script>

<div class="set-item">
  <CollapseIndicator bind:collapsed bind:toggle />
  <div class="set-item-label clickable fullwidth" on:click={toggle}>{label}</div>
</div>
{#if !collapsed}
  <div class="section" transition:slide={{ duration: 200 }}>
    <slot />
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
