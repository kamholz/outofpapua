<script>
  import Table from '$components/Table.svelte';
  import { getContext } from 'svelte';
  import { preferences } from '$lib/stores';

  export let rows;
  export let query;
  const editable = getContext('editable');

  const columns = [
    {
      key: 'reference',
      title: 'Reference',
      link: (row) => `/sources/${row.id}/entries?pagesize=${$preferences.tablePageSize}`,
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
