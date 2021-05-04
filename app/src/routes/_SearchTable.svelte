<script>
  import Table from '$components/Table.svelte';
  import { session } from '$app/stores';

  export let rows;
  export let query;
  export let pageCount;

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
    },
  ];

  if ($session.user) {
    controls.push({
      type: 'select',
      canSelect: () => true,
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
