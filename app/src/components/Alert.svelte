<script>
  import Icon from 'svelte-awesome';
  import { faTimes } from '@fortawesome/free-solid-svg-icons';
  import { slide } from 'svelte/transition';

  export let message;
  export let type;
  export let html = false;
  let open = true;
</script>

{#if message && open}
  <div class={type} transition:slide>
    {#if html}
      {@html message}
    {:else}
      {message}
    {/if}
    <span title="Close" on:click={() => open = false}>
      <Icon data={faTimes} />
    </span>
  </div>
{/if}

<style lang="scss">
  div {
    width: fit-content;
    max-width: 800px;
    margin-block: 1em;
    padding-block: .75em;
    padding-inline: 1.25em 2.25em;
    border-radius: 6px;
    border: 1px solid transparent;
    position: relative;
  
    &.error {
      @include error_color;
    }

    &.success {
      @include success_color;
    }
  }

  span {
    position: absolute;
    top: 2px;
    right: 2px;
  }
</style>
