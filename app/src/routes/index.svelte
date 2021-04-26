<script context="module">
  import { writable } from 'svelte/store';
  import { normalizeQuery } from '$lib/util';

  export async function load({ page: { query }, fetch }) {
    const props = {
      query: normalizeQuery(query)
    };
    if (['headword','gloss'].some(attr => attr in props.query)) {
      const res = await fetch('/api/search.json?' + new URLSearchParams(props.query));
      if (!res.ok) {
        return { status: 500, error: 'Internal error' };
      }
      const json = await res.json();
      props.rows = writable(json.rows);
      props.query = json.query;
      props.numPages = json.numPages;
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
  <SearchForm
    {query}
  />

  {#if rows}
    <h3>Search results</h3>
    <SearchTable
      {rows}
      {query}
      {numPages}
    />
  {/if}
</main>