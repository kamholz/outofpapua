<script context="module">
  import Table from '$components/Table.svelte';
  import Form from '$components/Form.svelte';
  import { normalizeQuery } from '$lib/util';

  export async function load({ page, fetch }) {
    const props = {
      query: normalizeQuery(page.query)
    };
    if (['headword','gloss'].some(attr => attr in props.query)) {
      const res = await fetch('/api/search.json' + '?' + new URLSearchParams(props.query));
      if (res.ok) {
        props.rows = await res.json();
      }
    }
    return { props };
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

  const fields = [
    {
      name: 'headword',
      label: 'Headword',
      type: 'text',
    },
    {
      name: 'gloss',
      label: 'Gloss',
      type: 'text',
    },
    {
      label: 'Search',
      type: 'submit',
    }
  ];
</script>

<script>
  export let rows;
  export let query;
</script>

<main>
  <Form {fields} values={query} />

  {#if rows}
    <h2>Search results</h2>
    <Table {columns} {rows} />
  {/if}
</main>
