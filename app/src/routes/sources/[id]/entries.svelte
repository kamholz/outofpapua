<script context="module">
  import { optionalQuery, stringify } from '$lib/util';
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
  import SourceTable from './_Table.svelte';

  export let source;
  export let rows;
  export let query;
  export let pageCount;
  export let rowCount;
  const reference = stringify(source.reference);
</script>

<h2>{source.title}{reference && `, ${reference}`}</h2>
{#if source.reference_full}
  <div class="info">
    Full reference: {source.reference_full}
  </div>
{/if}
{#if $rows.length}
  <div class="info">
    Total glosses: {rowCount}
  </div>
  <SourceTable
    {rows}
    {query}
    {pageCount}
  />
  <PageSizeSelect {query} />
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
</style>
