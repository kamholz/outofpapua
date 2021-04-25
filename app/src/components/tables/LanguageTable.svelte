<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { boolean } from '$lib/util';
  import { pageLoading } from '$stores';
  import * as crud from '$actions/crud';
  import Alert from '$components/Alert.svelte';
  import Table from '$components/Table.svelte';

  export let editable;
  export let rows;
  let error = null;

  const columns = [
    {
      key: 'name',
      title: 'Language',
      editable: true,
      type: 'text',
    },
    {
      key: 'iso6393',
      title: 'ISO 639-3 Code',
    },
    {
      key: 'is_proto',
      title: 'Proto-language',
      value: row => boolean(row.is_proto),
    },
    {
      key: 'parent_name',
      title: 'Parent',
      editable: true,
      type: 'autocomplete',
      autocomplete: {
        component: {
          extract: item => item.name,
          filter: item => !item.is_proto,
        },
        getData: () => rows,
        initialValue: row => row.parent_name ?? "",
        serializedValue: value => value === "" ? null : value,
        updateKey: 'parent_id',
        updateValue: item => item.id,
      },
    }
  ];

  const controls = editable
    ?
      [
        {
          type: 'delete',
          candelete: row => row.is_proto,
          confirm: row => confirm(`Are you sure you want to delete "${row.name}"?`),
        }
      ]
    :
      null;

  const updateFromCell = crud.updateFromCell('languages');
  const del = crud.makeDeleter('languages');

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

  async function handleDelete(e) {
    $pageLoading++;
    try {
      error = null;
      await del(e.detail.id);
      dispatch('refresh');
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
  {editable}
  {controls}
  on:update={handleUpdate}
  on:delete={handleDelete}
/>