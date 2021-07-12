<script>
  export let collapsed;
  export const toggle = function () {
    collapsed = !collapsed;
  };
</script>

{#if collapsed}
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