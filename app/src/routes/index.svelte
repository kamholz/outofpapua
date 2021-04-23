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
  import Table from '$components/Table.svelte';
  import Form from '$components/Form.svelte';
  //import Alert from '$components/Alert.svelte';

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
    }
  ];
</script>

<main>
  <h2>Search</h2>
  <Form
    {fields}
    values={query}
    submitLabel="Search"
    preventDefault={false}
  />

  {#if rows}
    <h3>Search results</h3>
    <Table {columns} {rows} />
  {/if}
</main>
