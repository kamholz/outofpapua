<script>
  import Table from '$components/Table.svelte';

  export let rows;
  export let query;
  export let pageCount;
  export let linkable;

  const columns = [
    {
      key: 'language',
      title: 'Language',
    },
    {
      key: 'source',
      title: 'Source',
    },
    {
      key: 'headword',
      title: 'Headword',
      link: (row) => `/records/${row.record_id}`,
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

  if (linkable) {
    controls.push({
      type: 'select',
    });
  }
</script>

<Table
  {columns}
  {rows}
  {query}
  {controls}
  sortable
  paginated
  {pageCount}
  highlight
/>
