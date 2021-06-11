<script>
  import Table from '$components/Table.svelte';

  export let rows;
  export let query;
  export let pageCount;

  const columns = [
    {
      key: 'name',
      title: 'Name',
      link: (row) => `/sets/${row.id}`,
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
  highlight
/>
