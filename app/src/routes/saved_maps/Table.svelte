<script>
  import Alert from '$components/Alert.svelte';
  import Table from '$components/Table.svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { pageLoading } from '$lib/stores';
  import * as crud from '$actions/crud';

  export let rows;

  const columns = [
    {
      key: 'name',
      title: 'Map',
      editable: true,
    },
  ];

  const controls = [
    {
      type: 'view',
      link: (row) => `/saved_maps/${row.id}`,
    },
    {
      type: 'delete',
      confirm: (row) => confirm(`Are you sure you want to delete "${row.name}"?`),
    },
  ];

  const updateFromCell = crud.updateFromCell('saved_map');
  const del = crud.makeDeleter('saved_map');
  let promise;

  async function handleUpdate(e) {
    $pageLoading++;
    try {
      promise = updateFromCell(e);
      await promise;
    } catch (err) {}
    $pageLoading--;
  }

  async function handleDelete(e) {
    const row = e.detail;
    $pageLoading++;
    try {
      promise = del(row.id);
      await promise;
      dispatch('refresh');
    } catch (e) {}
    $pageLoading--;
  }
</script>

{#await promise catch { message }}
  <Alert type="error">{message}</Alert>
{/await}
<Table
  {columns}
  {rows}
  {controls}
  editable
  on:update={handleUpdate}
  on:delete={handleDelete}
/>
