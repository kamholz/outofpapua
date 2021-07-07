<script>
  import { getContext } from 'svelte';

  const { collapsed, toggle } = getContext('collapsible');
</script>

{#if $collapsed}
  <div on:click={toggle}>▶</div>
{:else}
  <div on:click={toggle}>▼</div>
{/if}

<style>
  div {
    inline-size: 1.5em;
    cursor: default;
    user-select: none;
  }
</style>