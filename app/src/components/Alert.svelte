<script>
  import Icon from 'svelte-awesome';
  import { faTimes } from '@fortawesome/free-solid-svg-icons';
  import { slide } from 'svelte/transition';

  let { type, children } = $props();
  let open = $state(true);
</script>

{#if open}
  <div class={type} transition:slide>
    {@render children?.()}
    <span title="Close" onclick={() => open = false}>
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
