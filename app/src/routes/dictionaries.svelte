<script context="module">
  import Table from '$components/Table.svelte';

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

  const columns = [
    {
      key: 'title',
      title: 'Title',
    },
    {
      key: 'language',
      title: 'Language',
    },
    {
      key: 'reference',
      title: 'Reference',
    }
  ];
</script>

<script>
  export let rows;
  export let editable;
</script>

<main>
  <h2>Dictionaries</h2>
  {#if rows}
    <Table {columns} {rows} {editable} />
  {:else}
    <span>error</span>
  {/if}
</main>
