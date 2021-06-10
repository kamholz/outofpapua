<script context="module">
  import { optionalQuery } from '$lib/util';
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  export async function load({ page: { params, query }, fetch }) {
    const props = {};
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

  export let source;
  export let rows;
  export let query;
  export let pageCount;
  export let rowCount;

  const setSummaryCache = writable({});
  setContext('setSummaryCache', setSummaryCache);
</script>

<h2>{source.reference}</h2>
{#if source.reference_full}
  <div class="info">
    <em>Cite this> source as:</em> {source.reference_full}
  </div>
{/if}

<h3>Search entries</h3>
<SearchForm
  {query}
/>

{#if $rows.length}
  <div class="info">
    Total glosses: {rowCount}
  </div>
  <SourceTable
    {rows}
    {query}
    {pageCount}
  />
  <div class="controls">
    <PageSizeSelect {query} />
  </div>
{:else}
  <div class="notfound">no entries</div>
{/if}

<style>
  .info {
    margin-block: 20px;
    text-indent: -1em;
    padding-inline-start: 1em;
  }

  .notfound {
    font-style: italic;
  }

  .controls {
    margin-block: 20px;
  }
</style>
