<script context="module">
  import Table from '$components/Table.svelte';

  export async function load({ fetch }) {
      const res = await fetch('/query/languages.json');
      if (res.ok) {
        return { props: { rows: await res.json() } };
      }

    return {};
  }

  const columns = [
    {
      key: 'name',
      title: 'Language',
    },
    {
      key: 'iso6393',
      title: 'ISO 639-3 Code',
    },
    {
      key: 'is_proto',
      title: 'Proto-language',
      value: row => row.is_proto ? 'yes' : 'no',
    },
    {
      key: 'parent_name',
      title: 'Parent',
    }
  ];
</script>

<script>
  export let rows;
</script>

<main>
  <h2>Languages</h2>
  {#if rows}
    <Table {columns} {rows} />
  {:else}
    <span>error</span>
  {/if}
</main>
