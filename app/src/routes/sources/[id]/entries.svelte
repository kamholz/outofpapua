<script context="module">
  import { optionalQuery } from '$lib/util';
  import { writable } from 'svelte/store';
  import * as suggest from '$actions/suggest';

  export async function load({ fetch, page: { params, query }, session }) {
    const props = {
      editable: session.user !== null,
    };
    if (props.editable) {
      props.borrowlangSuggest = await suggest.borrowlang(fetch);
      if (!props.borrowlangSuggest) {
        return { status: 500, error: 'Internal error' };
      }
    }

    let res = await fetch(`/api/source/${params.id}.json`);
    if (!res.ok) {
      return { status: 500, error: 'Internal error' };
    }
    props.source = await res.json();
    res = await fetch(`/api/source/${params.id}/entries.json` + optionalQuery(query));
    if (!res.ok) {
      return { status: 500, error: 'Internal error' };
    }
    Object.assign(props, await res.json()); // populates query, pageCount, rows, rowCount
    props.rows = writable(props.rows);

    return { props };
  }
</script>

<script>
  import PageSizeSelect from '$components/PageSizeSelect.svelte';
  import SearchForm from './_SearchForm.svelte';
  import SourceTable from './_Table.svelte';
  import { setContext } from 'svelte';

  export let source;
  export let rows;
  export let query;
  export let editable;
  setContext('editable', editable);
  export let pageCount;
  export let rowCount;
  export let borrowlangSuggest = null;
  if (borrowlangSuggest) {
    setContext('borrowlangSuggest', borrowlangSuggest);
  }

  const setSummaryCache = writable({});
  setContext('setSummaryCache', setSummaryCache);
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

{#if $rows.length}
  <div class="info">
    Total entries: {rowCount}
  </div>
  <SourceTable
    {rows}
    {query}
    {source}
    {pageCount}
  />
  <div class="controls">
    <PageSizeSelect {query} preferenceKey="tablePageSize" />
  </div>
{:else}
  <div class="notfound">no entries found</div>
{/if}

<style lang="scss">
  .info {
    margin-block: $item_sep;
    @include indent;
  }

  .controls {
    margin-block: $item_sep;
  }
</style>
