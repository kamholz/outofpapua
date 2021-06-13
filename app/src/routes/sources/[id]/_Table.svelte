<script>
  import Table from '$components/Table.svelte';

  export let rows;
  export let query;
  export let editable;
  export let pageCount;
  export let borrowlangSuggest;

  const columns = [
    {
      key: 'headword',
      title: 'Headword',
      link: (row) => `/records/${row.record_id}`,
      // linkClass: (row) => row.origin,
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
    },
    {
      type: 'entryinfo',
      editable,
      borrowlangSuggest,
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
