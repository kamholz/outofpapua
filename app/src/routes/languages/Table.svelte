<script>
  import Alert from '$components/Alert.svelte';
  import Table from '$components/Table.svelte';
  import { getContext } from 'svelte';
  import { pageLoading } from '$lib/stores';
  import * as crud from '$actions/crud';

  export let rows;
  export let query;
  export let showLanguagesWithNoEntries;
  const editable = getContext('editable');
  const regionSuggest = getContext('regionSuggest');
  $: parents = rows.filter((row) => row.is_proto);
  $: visibleRows = query.editor_mode || showLanguagesWithNoEntries
    ? rows
    : rows.filter((row) => row.is_proto || row.numentries !== '0');

  const columnsShared = [
    {
      key: 'name',
      title: 'Language',
      editable: true,
    },
    {
      key: 'iso6393',
      title: 'ISO 639-3',
    },
  ];

  $: columnParentName = {
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
  };

  $: columnsNormalMode = [
    ...columnsShared,
    {
      key: 'numentries',
      title: '#Entries',
    },
    columnParentName,
  ];

  $: columnsEditorMode = [
    ...columnsShared,
    columnParentName,
    {
      key: 'region',
      title: 'Region',
      editable: true,
      type: 'autocomplete',
      autocomplete: {
        options: regionSuggest,
        valueField: 'name',
        labelField: 'name',
        rowKey: 'region',
      },
    },
    {
      key: 'location',
      title: 'Location',
      editable: true,
    },
  ];

  $: columns = query.editor_mode ? columnsEditorMode : columnsNormalMode;

  const controls = editable
    ?
    [
      {
        type: 'edit',
        link: (row) => `/languages/${row.id}`,
      },
    ]
    :
    null;

  const updateFromCell = crud.updateFromCell('language');
  let promise;

  async function handleUpdate(e) {
    $pageLoading++;
    try {
      promise = updateFromCell(e);
      await promise;
    } catch (err) {}
    $pageLoading--;
  }
</script>

{#await promise catch { message }}
  <Alert type="error">{message}</Alert>
{/await}
<div class:editormode={query.editor_mode}>
  <Table
    {columns}
    rows={visibleRows}
    {query}
    {editable}
    {controls}
    sortable
    highlight
    on:update={handleUpdate}
  />
</div>

<style lang="scss">
  .editormode :global {
    table {
      width: 100%;
    }
    td, th {
      overflow-wrap: anywhere;
    }
    th:nth-child(1), td:nth-child(1) {
      width: 20%;
    }
    th:nth-child(2), td:nth-child(2) {
      width: 8%;
    }
    th:nth-child(3), td:nth-child(3) {
      width: 30%;
    }
    th:nth-child(4), td:nth-child(4) {
      width: 20%;
    }
    th:nth-child(5), td:nth-child(5) {
      width: 22%;
    }
  }
</style>