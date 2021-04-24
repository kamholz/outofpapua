<script context="module">
  import { normalizeQuery } from '$lib/util';

  export async function load({ page, fetch }) {
    const props = {
      query: normalizeQuery(page.query)
    };
    if (['headword','gloss'].some(attr => attr in props.query)) {
      const res = await fetch('/api/search.json' + '?' + new URLSearchParams(props.query));
      if (!res.ok) {
        return { status: 500, error: 'Internal error' };
      }
      props.rows = await res.json();
    }
    return { props };
  }
</script>

<script>
  import SearchTable from '$components/tables/SearchTable.svelte';
  import SearchForm from '$components/forms/SearchForm.svelte';
  //import Alert from '$components/Alert.svelte';

  export let rows = null;
  export let query;
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
    />
  {/if}
</main>
