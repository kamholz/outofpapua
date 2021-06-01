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

  const controls = [
    {
      type: 'set',
      getSetId: (row) => row.set_id,
      link: (row) => `/sets/${row.set_id}`,
      prefetch: false,
    },
  ];
</script>

<Table
  {columns}
  {rows}
  {query}
  {controls}
  sortable
  paginated
  {pageCount}
/>
