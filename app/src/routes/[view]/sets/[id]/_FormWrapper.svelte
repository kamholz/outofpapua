<script>
  import CollapseIndicator from '$components/CollapseIndicator.svelte';
  import { slide } from 'svelte/transition';

  export let collapsed;
  export let label;
  let toggle;
</script>

<div class="set-item">
  <CollapseIndicator bind:collapsed bind:toggle />
  <div class="set-item-label clickable fullwidth" on:click={toggle}>{label}</div>
</div>
{#if !collapsed}
  <div class="form" transition:slide={{ duration: 200 }}>
    <slot />
  </div>
{/if}

<style lang="scss">
  .clickable {
    cursor: default;
  }

  .form {
    margin-block-start: 12px;
  }
</style>