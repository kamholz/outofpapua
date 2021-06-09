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

    :global(form) {
      flex-grow: 1;
      width: unset;
      padding: 0;
      border: none;

      :global(> div) {
        margin: 0;
        display: flex;
        align-items: center;

        :global(input) {
          flex-grow: 1;
        }
      }

      :global(> div:not(.controls) > :first-child) {
        flex-shrink: 0;
        inline-size: 8.5em;
      }

      :global(> div:not(:last-child)) {
        margin-block-end: 12px;
      }
    }
  }
</style>