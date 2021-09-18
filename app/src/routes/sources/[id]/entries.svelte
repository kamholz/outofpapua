<script context="module">
  import { optionalQuery } from '$lib/util';
  import * as suggest from '$actions/suggest';

  export async function load({ fetch, page: { params, query }, session }) {
    const props = {};
    if (session.user) {
      props.borrowlangSuggest = await suggest.borrowlang(fetch);
      if (!props.borrowlangSuggest) {
        return { status: 500 };
      }
    }

    const res = await fetch(`/api/source/${params.id}.json`);
    if (!res.ok) {
      return { status: 404 };
    }
    props.source = await res.json();
    const json = await reload(fetch, params.id, query);
    if (!json) {
      return { status: 500 };
    }
    Object.assign(props, json); // populates query, pageCount, rows, rowCount

    return { props };
  }

  async function reload(fetch, id, query) {
    const res = await fetch(`/api/source/${id}/entries.json?` + optionalQuery(query));
    return res.ok ? res.json() : null;
  }
</script>

<script>
  import PageSizeSelect from '$components/PageSizeSelect.svelte';
  import SearchForm from './_SearchForm.svelte';
  import SourceTable from './_Table.svelte';
  import { pageLoading } from '$lib/stores';
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  export let source;
  export let rows;
  export let query;
  export let pageCount;
  export let rowCount;
  export let borrowlangSuggest = null;
  if (borrowlangSuggest) {
    setContext('borrowlangSuggest', borrowlangSuggest);
  }

  const setSummaryCache = writable({});
  setContext('setSummaryCache', setSummaryCache);

  async function handleRefresh() {
    $pageLoading++;
    rows = (await reload(fetch, source.id, query))?.rows;
    $pageLoading--;
    $setSummaryCache = {};
  }
</script>

<h2>{source.reference}</h2>
{#if source.reference_full}
  <div class="info">
    <em>Cite this source as:</em> {source.reference_full}
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
    @include indent;
  }

  .controls {
    margin-block: var(--item-sep);
  }
</style>
