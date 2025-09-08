<script>
  import Table from '$components/Table.svelte';
  import { getContext } from 'svelte';
  import { pageLoading } from '$lib/stores';
  import * as crud from '$actions/crud';

  export let rows;
  export let query;
  const editable = getContext('editable');
  const preferences = getContext('preferences');

  const columnsReadOnly = [
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

  const columnsEditMode = [
    {
      key: 'reference',
      title: 'Reference',
      editable: true,
    },
    {
      key: 'reference_full',
      title: 'Full Reference',
      editable: true,
    },
    {
      key: 'note',
      title: 'Note',
      editable: true,
    },
    {
      key: 'language',
      title: 'Language',
    },
    {
      key: 'ipa_conversion_rule',
      title: 'IPA Conversion',
    },
  ];

  $: columns = query.edit_mode ? columnsEditMode : columnsReadOnly;

  const controls = [
    {
      type: editable ? 'edit' : 'view',
      link: (row) => `/sources/${row.id}`,
    },
  ];

  const updateFromCell = crud.updateFromCell('source');
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

<div class:editmode={query.edit_mode}>
  <Table
    {columns}
    {rows}
    {query}
    {controls}
    editable={query.edit_mode}
    sortable
    highlight
    on:update={handleUpdate}
  />
</div>

<style lang="scss">
  .editmode :global {
    table {
      width: 100%;
    }
    td, th {
      overflow-wrap: anywhere;
    }
    th:nth-child(1), td:nth-child(1) {
      width: 10%;
    }
    th:nth-child(2), td:nth-child(2) {
      width: 35%;
    }
    th:nth-child(3), td:nth-child(3) {
      width: 33%;
    }
    th:nth-child(4), td:nth-child(4) {
      width: 9%;
    }
    th:nth-child(5), td:nth-child(5) {
      width: 13%;
    }
  }
</style>