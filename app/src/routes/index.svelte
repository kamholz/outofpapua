<script context="module">
  import Table from '$components/Table.svelte';
  import SearchForm from '$components/SearchForm.svelte';
  import { normalizeQuery } from '$lib/util';

  let query = {};

  export async function load({ page, fetch }) {
    query = normalizeQuery(page.query);
    if (['headword','gloss'].some(attr => attr in query)) {
      const res = await fetch('/query/search.json' + '?' + new URLSearchParams(query));
      if (res.ok) {
        return { props: { rows: await res.json() } };
      }
    }

    return {};
  }

  const columns = [
    {
      key: 'language',
      title: 'Language',
    },
    {
      key: 'headword',
      title: 'Headword',
    },
    {
      key: 'pos',
      title: 'POS',
    },
    {
      key: 'gloss',
      title: 'Gloss',
    },
    {
      key: 'gloss_language',
      title: 'Gloss Language',
    }
  ];
</script>

<script>
  export let rows;
</script>

<main>
  <SearchForm {...query} />

  {#if rows}
    <h2>Search results</h2>
    <Table {columns} {rows} />
  {/if}
</main>
