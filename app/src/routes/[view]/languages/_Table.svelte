<script>
  import Alert from '$components/Alert.svelte';
  import Table from '$components/Table.svelte';
  import { getContext } from 'svelte';
  import { pageLoading } from '$lib/stores';
  import * as crud from '$actions/crud';
  
  export let rows;
  export let query;
  const view = getContext('view');
  const editable = getContext('editable');
  $: parents = rows.filter((row) => row.is_proto);

  $: columns = [
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
  ];

  const controls = editable
    ?
    [
      {
        type: 'edit',
        link: (row) => `/${view}/languages/${row.id}`,
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
/>
