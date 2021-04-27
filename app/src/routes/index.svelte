<script context="module">
  import { writable } from 'svelte/store';
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

    const res = await fetch('/api/languages.json?category=gloss');
    if (res.ok) {
      props.glosslang = (await res.json()).rows;
      if ('glosslang' in props.query) {
        const set = new Set(props.query.glosslang);
        props.query.glosslang = props.glosslang.filter(v => set.has(v.id));
      }
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