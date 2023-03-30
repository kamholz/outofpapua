<script>
  import List from './List.svelte';
  import PageSizeSelect from '$components/PageSizeSelect.svelte';
  import SearchForm from './SearchForm.svelte';
  import { invalidateAll } from '$app/navigation';
  import { pageLoading } from '$lib/stores';
  import { setContext } from 'svelte';

  export let data;
  $: ({
    rows,
    query,
    pageCount,
    rowCount,
  } = data);
  const {
    setAuthorSuggest,
    sourceSuggest,
    langSuggest,
    glosslangSuggest,
    borrowlangSuggest,
  } = data;
  setContext('setAuthorSuggest', setAuthorSuggest);
  setContext('sourceSuggest', sourceSuggest);
  setContext('langSuggest', langSuggest);
  setContext('glosslangSuggest', glosslangSuggest);
  if (borrowlangSuggest) {
    setContext('borrowlangSuggest', borrowlangSuggest);
  }

  async function handleRefresh() {
    $pageLoading++;
    await invalidateAll();
    $pageLoading--;
  }
</script>

<svelte:head>
  <title>Search sets | Out of Papua</title>
</svelte:head>

<h2>Search sets</h2>
<SearchForm
  {query}
/>

{#if rows}
  {#if rows.length}
    <div class="info">
      Total sets found: {rowCount}
    </div>
    <List
      {rows}
      {query}
      {pageCount}
      on:refresh={handleRefresh}
    />
    <div class="controls">
      <PageSizeSelect {query} preferenceKey="listPageSize" />
    </div>
  {:else}
    <div class="notfound">no sets found</div>
  {/if}
{/if}

<style lang="scss">
  .info {
    margin-block: var(--item-sep);
    @include indent;
  }

  .controls {
    margin-block: var(--item-sep);
  }
</style>
