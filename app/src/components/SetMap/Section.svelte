<script>
  import CollapseIndicator from '$components/CollapseIndicator.svelte';
  import { slide } from 'svelte/transition';

  export let collapsed = false;
  export let name;
</script>

<div class="section">
  <div class="heading">
    <CollapseIndicator bind:collapsed />
    <h3>{name}</h3>
  </div>
  {#if !collapsed}
    <div class="content" transition:slide={{ duration: 200 }}>
      <slot />
    </div>
  {/if}
</div>

<style>
  h3 {
    margin: 0;
  }

  .section {
    margin-block-end: 1.5em;
  }

  .heading {
    display: flex;
    align-items: center;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-block-start: 1em;
  }
</style>