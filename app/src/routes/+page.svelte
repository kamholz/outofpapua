<script>
  import Alert from '$components/Alert.svelte';
  import PageSizeSelect from '$components/PageSizeSelect.svelte';
  import SearchForm from './SearchForm.svelte';
  import SearchTable from './SearchTable.svelte';
  import SearchTableControls from './SearchTableControls.svelte';
  import { getContext, setContext } from 'svelte';
  import { goto, invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import { pageLoading, setSummaryCache } from '$lib/stores';
  import { serializeArrayParam } from '$lib/util';
  import { writable } from 'svelte/store';
  import * as crudSet from '$actions/crud/set';

  export let data;
  $: ({
    rows,
    query,
    pageCount,
    rowCount,
  } = data);
  const {
    langSuggest,
    glosslangSuggest,
    regionSuggest,
    borrowlangSuggest,
  } = data;
  setContext('langSuggest', langSuggest);
  setContext('glosslangSuggest', glosslangSuggest);
  setContext('regionSuggest', regionSuggest);
  if (borrowlangSuggest) {
    setContext('borrowlangSuggest', borrowlangSuggest);
  }

  $: linkable = getContext('editable') && query.set !== 'linked';
  const selection = writable();
  setContext('selection', selection);
  setContext('setSummaryCache', setSummaryCache);
  let promise;

  $: init($page);

  function init() {
    $setSummaryCache = {};
    clearSelection();
  }

  async function handleLink() {
    $pageLoading++;
    try {
      promise = crudSet.linkEntries(getSelection(), handleRefresh);
      await promise;
    } catch (e) {}
    $pageLoading--;
  }

  function handleMap() {
    goto('/map?' + new URLSearchParams({ entries: serializeArrayParam([...$selection]) }));
  }

  async function handleRefresh() {
    $pageLoading++;
    await invalidateAll();
    $pageLoading--;
    init();
  }

  function getSelection() {
    return rows.filter((row) => $selection.has(row.id));
  }

  function clearSelection() {
    $selection = new Set();
  }
</script>

<svelte:head>
  <title>Search entries | Out of Papua</title>
</svelte:head>

<h2>Search entries</h2>
<SearchForm
  {query}
/>
{#if rows}
  <div class="container">
    {#if rows.length}
      <div class="controls">
        <div>
          Total found: {rowCount}
        </div>
        <SearchTableControls {linkable} on:clear={clearSelection} on:link={handleLink} on:map={handleMap} />
      </div>
      {#if promise}
        {#await promise catch { message }}
          <Alert type="error">{message}</Alert>
        {/await}
      {/if}
      <SearchTable
        {rows}
        {query}
        {pageCount}
        on:link={handleRefresh}
      />
      <div class="controls">
        <PageSizeSelect {query} preferenceKey="tablePageSize" />
        {#if rows.length}
          <SearchTableControls {linkable} on:clear={clearSelection} on:link={handleLink} on:map={handleMap} />
        {/if}
      </div>
    {:else}
      <div class="notfound">nothing found</div>
    {/if}
  </div>
{/if}

<style lang="scss">
  hr {
    margin-block-start: var(--item-sep);
  }

  .container {
    display: inline-block;
  }

  .controls {
    margin-block: var(--item-sep);
    display: flex;
    justify-content: space-between;
  }
</style>
