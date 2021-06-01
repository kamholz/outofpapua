<script>
  import Table from '$components/Table.svelte';

  export let rows;
  export let query;
  export let pageCount;

  const columns = [
    {
      key: 'headword',
      title: 'Headword',
      link: (row) => `/records/${row.record_id}`,
    },
    {
      key: 'senses',
      title: 'Glosses',
      type: 'senses',
      multilang: true,
    },
  ];
</script>

<Table
  {columns}
  {rows}
  {query}
  sortable
  paginated
  {pageCount}
/>
