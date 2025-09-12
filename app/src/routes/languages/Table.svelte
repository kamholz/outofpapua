<script>
  import Alert from '$components/Alert.svelte';
  import Table from '$components/Table.svelte';
  import { getContext } from 'svelte';
  import { pageLoading } from '$lib/stores';
  import * as crud from '$actions/crud';

  let { rows, query, showLanguagesWithNoEntries } = $props();
  const editable = getContext('editable');
  let parents = $derived(rows.filter((row) => row.is_proto));
  let visibleRows = $derived(showLanguagesWithNoEntries
    ? rows
    : rows.filter((row) => row.is_proto || row.numentries !== '0'));

  let columns = $derived([
    {
      key: 'name',
      title: 'Language',
      editable: true,
    },
    {
      key: 'iso6393',
      title: 'ISO 639-3',
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
  ]);

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
  let promise = $state();

  async function handleUpdate(e) {
    $pageLoading++;
    try {
      promise = updateFromCell(e);
      await promise;
    } catch (err) {}
    $pageLoading--;
  }
</script>

{#await promise catch {message }}
  <Alert type="error">{message}</Alert>
{/await}
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
