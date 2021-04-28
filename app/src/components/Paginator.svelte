<script>
  import Arrow from '$components/Paginator/Arrow.svelte';
  import Number from '$components/Paginator/Number.svelte';

  const pageWidth = 2;

  export let query;
  export let pageCount;
  $: page = query.page;
  $: pagesToDisplay = [...Array(pageCount).keys()].slice(
    Math.max(page - pageWidth - 1, 1),
    Math.min(page + pageWidth, pageCount - 1)
  );

  function pageUrl(page) {
    return '?' + new URLSearchParams({...query, page});
  }
</script>

<div>
  <Arrow dir="previous" url={page > 1 && pageUrl(page - 1)} />
  <Number num={1} {page} {pageUrl} />
  {#if page - pageWidth > 3}
    <span>…</span>
  {/if}
  {#if page - pageWidth === 3}
    <Number num={2} {page} {pageUrl} />
  {/if}
  {#each pagesToDisplay as i (i)}
    <Number num={i+1} {page} {pageUrl} />
  {/each}
  {#if page + pageWidth < pageCount - 2}
    <span>…</span>
  {/if}
  {#if page + pageWidth === pageCount - 2}
    <Number num={pageCount - 1} {page} {pageUrl} />
  {/if}
  <Number num={pageCount} {page} {pageUrl} />
  <Arrow dir="next" url={page < pageCount && pageUrl(page + 1)} />
</div>

<style lang="scss">
  div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-inline-size: 480px;
    border: 2px solid #666;
    border-radius: 4px;
    padding: 4px;
    margin-block-start: 8px;
    margin-block-end: 8px;
    color: grey;

    :global(a) {
      text-decoration: none;
      color: black;
    }
  }
</style>