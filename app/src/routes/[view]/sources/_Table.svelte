<script>
  import Table from '$components/Table.svelte';
  import { getContext } from 'svelte';

  export let rows;
  export let query;
  const view = getContext('view');
  const editable = getContext('editable');
  const preferences = getContext('preferences');

  const columns = [
    {
      key: 'reference',
      title: 'Reference',
      link: (row) => `/${view}/sources/${row.id}/entries?pagesize=${$preferences.tablePageSize}`,
    },
    {
      key: 'language',
      title: 'Language',
    },
    {
      key: 'numentries',
      title: '#Entries',
    },
  ];

  const controls = [
    {
      type: editable ? 'edit' : 'view',
      link: (row) => `/${view}/sources/${row.id}`,
    },
  ];
</script>

<Table
  {columns}
  {rows}
  {query}
  {controls}
  sortable
  on:link
/>
