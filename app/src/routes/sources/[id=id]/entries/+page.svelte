<script>
  import PageSizeSelect from '$components/PageSizeSelect.svelte';
  import SearchForm from '../SearchForm.svelte';
  import SourceTable from '../Table.svelte';
  import { page } from '$app/stores';
  import { pageLoading, setSummaryCache } from '$lib/stores';
  import { setContext } from 'svelte';

  export let data;
  $: ({
    source,
    rows,
    query,
    pageCount,
    rowCount,
  } = data);
  const { borrowlangSuggest } = data;
  setContext('borrowlangSuggest', borrowlangSuggest);
  setContext('setSummaryCache', setSummaryCache);

  $: init(), $page;

  function init() {
    $setSummaryCache = {};
  }

  async function handleRefresh() {
    $pageLoading++;
    rows = (await reload(fetch, source.id, query))?.rows;
    $pageLoading--;
    init();
  }
</script>

<svelte:head>
  <title>Source entries: {source.reference} | Out of Papua</title>
</svelte:head>

<h2>{source.reference}: {source.language_name}</h2>
{#if source.reference_full}
  <div class="info">
    <em>Cite this source as:</em> {source.reference_full}
  </div>
{/if}
{#if source.note}
  <div class="info">
    <em>Notes on this source:</em> {source.note}
  </div>
{/if}

<h3>Search entries</h3>
<SearchForm
  {query}
/>

{#if rows.length}
  <div class="info">
    Total entries: {rowCount}
  </div>
  <SourceTable
    {rows}
    {query}
    {source}
    {pageCount}
    on:link={handleRefresh}
  />
  <div class="controls">
    <PageSizeSelect {query} preferenceKey="tablePageSize" />
  </div>
{:else}
  <div class="notfound">no entries found</div>
{/if}

<style lang="scss">
  .info {
    margin-block: var(--item-sep);
    max-width: var(--text-max-width);
    @include indent;
  }

  .controls {
    margin-block: var(--item-sep);
  }
</style>
