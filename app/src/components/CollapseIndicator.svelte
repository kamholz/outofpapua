<script>
  let { collapsed = $bindable() } = $props();
  export const toggle = function () {
    collapsed = !collapsed;
  };
</script>

{#if collapsed}
  <div><span onclick={toggle}>▶</span></div>
{:else}
  <div><span onclick={toggle}>▼</span></div>
{/if}

<style>
  div {
    inline-size: 1.5em;
    cursor: default;
    user-select: none;
  }
</style>
