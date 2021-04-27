<script context="module">
  import { writable } from 'svelte/store';
  import * as suggest from '$actions/suggest';
  import { normalizeQuery, parseArrayNumParams } from '$lib/util';

  const arrayNumParams = new Set(['glosslang']);

  export async function load({ page: { query }, fetch }) {
    const props = {};
    query = normalizeQuery(query);
    if (['headword','gloss'].some(attr => attr in query)) {
      const res = await fetch('/api/search.json?' + new URLSearchParams(query));
      if (!res.ok) {
        return { status: 500, error: 'Internal error' };
      }
      Object.assign(props, await res.json());
      props.rows = writable(props.rows);
    } else {
      parseArrayNumParams(query, arrayNumParams);
      props.query = query;
    }

    props.glosslang = await suggest.glosslang(fetch);
    if (!props.glosslang) {
      return { status: 500, error: 'Internal error' };
    }

    return { props };
  }
</script>

<script>
  import SearchTable from '$components/tables/SearchTable.svelte';
  import SearchForm from '$components/forms/SearchForm.svelte';

  export let rows = null;
  export let glosslang;
  export let query;
  export let numPages;
</script>

<main>
  <h2>Search</h2>
  <SearchForm
    {query}
    {glosslang}
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