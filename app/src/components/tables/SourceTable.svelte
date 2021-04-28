<script>
  import { pageLoading } from '$stores';
  import * as crud from '$actions/crud';
  import Alert from '$components/Alert.svelte';
  import Table from '$components/Table.svelte';

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
    }
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
  sortable
  on:update={handleUpdate}
/>