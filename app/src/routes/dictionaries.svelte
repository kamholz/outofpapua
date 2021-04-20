<script context="module">
  import Table from '$components/Table.svelte';

  export async function load({ fetch }) {
      const res = await fetch('/api/dictionaries.json');
      if (res.ok) {
        return { props: { rows: await res.json() } };
      }

    return {};
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
</script>

<main>
  <h2>Dictionaries</h2>
  {#if rows}
    <Table {columns} {rows} />
  {:else}
    <span>error</span>
  {/if}
</main>
