<script>
  import CollapseIndicator from '$components/CollapseIndicator.svelte';
  import { slide } from 'svelte/transition';

  /**
   * @typedef {Object} Props
   * @property {boolean} [collapsed]
   * @property {any} name
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { collapsed = $bindable(false), name, children } = $props();
</script>

<div class="section">
  <div class="heading">
    <CollapseIndicator bind:collapsed />
    <h3 onclick={() => collapsed = !collapsed}>{name}</h3>
  </div>
  {#if !collapsed}
    <div class="content" transition:slide|local={{ duration: 200 }}>
      {@render children?.()}
    </div>
  {/if}
</div>

<style lang="scss">
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

    :global(> div) {
      width: 100%;
    }
  }
</style>
