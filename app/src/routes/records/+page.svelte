<script>
  import Alert from '$components/Alert.svelte';
  import PageSizeSelect from '$components/PageSizeSelect.svelte';
  import SearchForm from './SearchForm.svelte';
  import SearchTable from './SearchTable.svelte';
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
  } = data;
  setContext('sourceSuggest', sourceSuggest);
  setContext('langSuggest', langSuggest);
  setContext('regionSuggest', regionSuggest);
</script>

<svelte:head>
  <title>Search records | Out of Papua</title>
</svelte:head>

<h2>Search records</h2>
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
