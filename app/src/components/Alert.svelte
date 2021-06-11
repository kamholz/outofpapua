<script>
  import Icon from 'svelte-awesome';
  import { faTimes } from '@fortawesome/free-solid-svg-icons';
  import { slide } from 'svelte/transition';

  export let message;
  export let type;
  let open = true;
</script>

{#if message && open}
  <div class={type} transition:slide>
    {message}
    <span on:click={() => open = false}>
      <Icon data={faTimes} />
    </span>
  </div>
{/if}

<style lang="scss">
  div {
    margin-block: 1em;
    padding: .75rem 1.25rem;
    border-radius: .25rem;
    border: 1px solid transparent;
    position: relative;
  
    &.error {
      color: #721c24;
      background-color: #f8d7da;
      border-color: #f5c6cb;
    }

    &.success {
      color: #155724;
      background-color: #d4edda;
      border-color: #c3e6cb;      
    }
  }

  span {
    position: absolute;
    top: 0;
    right: 0;

    :global(.fa-icon:hover) {
      color: gray;
    }
  }
</style>
