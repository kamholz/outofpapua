<script context="module">
  import { writable } from 'svelte/store';
  import { normalizeQuery, parseSetParams } from '$lib/util';

  const setParams = new Set(['glosslang']);

  export async function load({ page: { query }, fetch }) {
    const props = {};
    query = normalizeQuery(query);
    parseSetParams(query, setParams);
    if (['headword','gloss'].some(attr => attr in query)) {
      const res = await fetch('/api/search.json?' + new URLSearchParams(query));
      if (!res.ok) {
        return { status: 500, error: 'Internal error' };
      }
      Object.assign(props, await res.json());
      props.rows = writable(props.rows);
    } else {
      props.query = query;
    }
    return { props };
  }
</script>

<script>
  import SearchTable from '$components/tables/SearchTable.svelte';
  import SearchForm from '$components/forms/SearchForm.svelte';

  export let rows = null;
  export let query;
  export let numPages;
</script>

<main>
  <h2>Search</h2>
  <SearchForm {query} />

  {#if rows}
    <h3>Search results</h3>
    <SearchTable
      {rows}
      {query}
      {numPages}
    />
  {/if}
</main>