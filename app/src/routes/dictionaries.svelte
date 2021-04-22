<script context="module">
  export async function load({ fetch, session }) {
    const props = {
      editable: session.user !== null
    };
    const res = await fetch('/api/sources.json');
    if (res.ok) {
      props.rows = await res.json();
    }
    return { props };
  }
</script>

<script>
  import Table from '$components/Table.svelte';
  import Error from '$components/Error.svelte';

  export let rows;
  export let editable;
  let error = null;

  const columns = [
    {
      key: 'title',
      title: 'Title',
      editable: true,
    },
    {
      key: 'language',
      title: 'Language',
    },
    {
      key: 'reference',
      title: 'Reference',
      editable: true,
    }
  ];
</script>

<main>
  <h2>Dictionaries</h2>
  {#if error}
    <Error message={error} />
  {/if}
  {#if rows}
    <Table {columns} {rows} {editable} />
  {/if}
</main>
