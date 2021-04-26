<script context="module">
  import { writable } from 'svelte/store';
  import { normalizeQuery } from '$lib/util';

  export async function load({ fetch, page: { query }, session }) {
    const props = {
      editable: session.user !== null,
      query: normalizeQuery(query),
    };
    const res = await fetch('/api/sources.json?' + query);
    if (!res.ok) {
      return { status: 500, error: 'Internal error' };
    }
    const json = await res.json();
    props.rows = writable(json.rows);
    props.query = json.query;
    return { props };
  }
</script>

<script>
  import SourceTable from '$components/tables/SourceTable.svelte';

  export let rows;
  export let query;
  export let editable;
</script>

<main>
  <h2>Sources</h2>
  <SourceTable
    {rows}
    {query}
    {editable} 
  />
</main>
