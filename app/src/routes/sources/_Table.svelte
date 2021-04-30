<script>
  import Alert from '$components/Alert.svelte';
  import Table from '$components/Table.svelte';
  import { pageLoading } from '$stores';
  import { session } from '$app/stores';
  import * as crud from '$actions/crud';

  export let rows;
  export let query;
  export let editable;
  let error = null;

  const columns = [
    {
      key: 'title',
      title: 'Title',
      editable: true,
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
      editable: true,
    },
  ];

  const controls = [
    {
      type: $session.user ? 'edit' : 'view',
      link: (row) => `/sources/${row.id}`,
    },
  ];

  const updateFromCell = crud.updateFromCell('source');

  async function handleUpdate(e) {
    $pageLoading++;
    try {
      error = null;
      await updateFromCell(e);
    } catch (err) {
      error = err.message;
    }
    $pageLoading--;
  }
</script>

<Alert type="error" message={error} />
<Table
  {columns}
  {rows}
  {query}
  {editable}
  {controls}
  sortable
  on:update={handleUpdate}
/>
