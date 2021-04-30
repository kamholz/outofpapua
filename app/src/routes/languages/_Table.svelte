<script>
  import Alert from '$components/Alert.svelte';
  import Table from '$components/Table.svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { boolean } from '$lib/util';
  import { derived } from 'svelte/store';
  import { pageLoading } from '$stores';
  import * as crud from '$actions/crud';
  
  export let rows;
  export let query;
  export let editable;

  const parents = derived(rows, ($rows) => $rows.filter((row) => row.is_proto));

  const columns = [
    {
      key: 'name',
      title: 'Language',
      editable: true,
      type: 'text',
    },
    {
      key: 'iso6393',
      title: 'ISO 639-3',
    },
    {
      key: 'is_proto',
      title: 'Proto-language',
      value: (row) => boolean(row.is_proto),
    },
    {
      key: 'numentries',
      title: '#Entries',
    },
    {
      key: 'parent_name',
      title: 'Parent',
      editable: true,
      type: 'autocomplete',
      autocomplete: {
        options: parents,
        valueField: 'id',
        labelField: 'name',
        rowKey: 'parent_id',
        filter: (option, row) => option.id !== row.id, // remove self
      },
    },
  ];

  const controls = editable
    ?
    [
      {
        type: 'delete',
        candelete: (row) => row.is_proto,
        confirm: (row) => confirm(`Are you sure you want to delete "${row.name}"?`),
      },
    ]
    :
    null;

  const updateFromCell = crud.updateFromCell('language');
  const del = crud.makeDeleter('language');
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
    $pageLoading++;
    try {
      promise = del(e.detail.id);
      await promise;
      dispatch('refresh');
    } catch (err) {}
    $pageLoading--;
  }
</script>

{#await promise catch { message }}
  <Alert type="error" {message} />
{/await}
<Table
  {columns}
  {rows}
  {query}
  {editable}
  {controls}
  sortable
  on:update={handleUpdate}
  on:delete={handleDelete}
/>
