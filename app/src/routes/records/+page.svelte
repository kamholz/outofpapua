<script>
  import PageSizeSelect from '$components/PageSizeSelect.svelte';
  import SearchForm from './SearchForm.svelte';
  import SearchTable from './SearchTable.svelte';
  import { invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import { pageLoading, setSummaryCache } from '$lib/stores';
  import { setContext } from 'svelte';

  export let data;
  $: ({
    rows,
    query,
    pageCount,
    rowCount,
  } = data);
  const {
    sourceSuggest,
    langSuggest,
    regionSuggest,
    borrowlangSuggest,
  } = data;
  setContext('sourceSuggest', sourceSuggest);
  setContext('langSuggest', langSuggest);
  setContext('regionSuggest', regionSuggest);
  if (borrowlangSuggest) {
    setContext('borrowlangSuggest', borrowlangSuggest);
  }

  setContext('setSummaryCache', setSummaryCache);

  $: init($page);

  function init() {
    $setSummaryCache = {};
  }

  async function handleRefresh() {
    $pageLoading++;
    await invalidateAll();
    $pageLoading--;
    init();
  }
</script>

<svelte:head>
  <title>Search entry records | Out of Papua</title>
</svelte:head>

<h2>Search entry records</h2>
<SearchForm
  {query}
/>

{#if rows}
  <div class="container">
    <div class="controls">
      <div>
        Total found: {rowCount}
      </div>
    </div>
    {#if rows.length}
      <SearchTable
        {rows}
        {query}
        {pageCount}
        on:link={handleRefresh}
      />
      <div class="controls">
        <PageSizeSelect {query} preferenceKey="tablePageSize" />
      </div>
    {:else}
      <div class="notfound">nothing found</div>
    {/if}
  </div>
{/if}

<style lang="scss">
  .container {
    display: inline-block;
  }

  .controls {
    margin-block: var(--item-sep);
    display: flex;
    justify-content: space-between;
  }
</style>
