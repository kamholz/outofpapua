<script>
  export let page;
  export let pageUrl;
  export let num;
</script>

{#if page === num}
  <span>{num}</span>
{:else}
  <a href={pageUrl(num)}>{num}</a>
{/if}

<style>
  a, span {
    inline-size: 24px;
    block-size: 24px;
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