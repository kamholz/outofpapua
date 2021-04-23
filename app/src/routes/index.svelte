<script context="module">
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
</script>

<script>
  import Table from '$components/Table.svelte';
  import Form from '$components/Form.svelte';
  import Alert from '$components/Alert.svelte';

  export let rows = null;
  export let query;

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

<main>
  <h2>Search</h2>
  <h3>test</h3>
  <Form {fields} values={query} />

  {#if rows}
    <h3>Search results</h3>
    <Table {columns} {rows} />
  {/if}
</main>
