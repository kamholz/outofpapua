<script>
  import Table from '$components/Table.svelte';
  import { session } from '$app/stores';

  export let rows;
  export let query;

  const columns = [
    {
      key: 'title',
      title: 'Title',
      link: (row) => `/sources/${row.id}/entries`,
    },
    {
      key: 'language',
      title: 'Language',
    },
    {
      key: 'numentries',
      title: '#Entries',
    },
    {
      key: 'reference',
      title: 'Reference',
    },
  ];

  const controls = [
    {
      type: $session.user ? 'edit' : 'view',
      link: (row) => `/sources/${row.id}`,
    },
  ];
</script>

<Table
  {columns}
  {rows}
  {query}
  {controls}
  sortable
/>
