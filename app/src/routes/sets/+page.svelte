<script>
  import List from './List.svelte';
  import PageSizeSelect from '$components/PageSizeSelect.svelte';
  import SearchForm from './SearchForm.svelte';
  import { setContext } from 'svelte';

  export let rows;
  export let setAuthorSuggest;
  setContext('setAuthorSuggest', setAuthorSuggest);
  export let sourceSuggest;
  setContext('sourceSuggest', sourceSuggest);
  export let langSuggest;
  setContext('langSuggest', langSuggest);
  export let glosslangSuggest;
  setContext('glosslangSuggest', glosslangSuggest);
  export let borrowlangSuggest = null;
  if (borrowlangSuggest) {
    setContext('borrowlangSuggest', borrowlangSuggest);
  }
  export let query;
  export let pageCount;
  export let rowCount;

  async function handleRefresh() {
    const json = await reload(fetch, query);
    if (json) {
      ({ rows } = json);
      ({ pageCount } = json);
      ({ rowCount } = json);
    }
  }
</script>

<svelte:head>
  <title>Search sets | Out of Papua</title>
</svelte:head>

<h2>Search sets</h2>
<SearchForm
  {query}
/>

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

<style lang="scss">
  .info {
    margin-block: var(--item-sep);
    @include indent;
  }

  .controls {
    margin-block: var(--item-sep);
  }
</style>
