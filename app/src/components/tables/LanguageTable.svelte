<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { derived } from 'svelte/store';
  import { boolean, nullify, stringify } from '$lib/util';
  import { pageLoading } from '$stores';
  import * as crud from '$actions/crud';
  import Alert from '$components/Alert.svelte';
  import Table from '$components/Table.svelte';

  export let rows;
  export let query;
  export let editable;
  let error = null;

  const parents = derived(rows, $rows => $rows.filter(row => row.is_proto));

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
      value: row => boolean(row.is_proto),
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
        data: parents,
        rowValue: row => stringify(row.parent_name),
        serializedValue: nullify,
        updateKey: 'parent_id',
        updateValue: item => item?.id ?? null,
        restprops: {
          extract: item => item.name,
        },
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
  {query}
  {editable}
  {controls}
  sortable
  on:update={handleUpdate}
  on:delete={handleDelete}
/>