<script>
  export let page;
  export let pageUrl;
  export let num;
  export let sort;
</script>

{#if page === num}
  <span>{num}</span>
{:else}
  <a href={pageUrl(num, sort)}>{num}</a>
{/if}

<style>
  a, span {
    padding-inline: 9px;
    padding-block: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid black;
    border-radius: 4px;
  }

  span {
    background-color: black;
    color: white;
  }
</style>
