<script context="module">
  import { optionalQuery } from '$lib/util';
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
  import SourceTable from './_Table.svelte';
  import { fade } from 'svelte/transition';

  export let source;
  export let rows;
  export let query;
  export let pageCount;
  export let rowCount;
</script>

<div in:fade={{ duration: 200 }}>
  <h2>Entries: {source.title}, {source.reference}</h2>
  {#if $rows.length}
    <SourceTable
      {rows}
      {query}
      {pageCount}
      {rowCount}
    />
  {:else}
    <div class="notfound">no entries</div>
  {/if}
</div>

<style>
  .notfound {
    font-style: italic;
  }
</style>
