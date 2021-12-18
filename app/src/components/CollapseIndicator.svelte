<script>
  export let collapsed;
  export const toggle = function () {
    collapsed = !collapsed;
  };
</script>

{#if collapsed}
  <div><span on:click={toggle}>▶</span></div>
{:else}
  <div><span on:click={toggle}>▼</span></div>
{/if}

<style>
  div {
    inline-size: 1.5em;
    cursor: default;
    user-select: none;
  }
</style>