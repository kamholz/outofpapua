<script>
  import { boolean } from '$lib/util';
  import { pageLoading } from '$stores';
  import * as crud from '$actions/crud';
  import Alert from '$components/Alert.svelte';
  import Table from '$components/Table.svelte';

  export let editable;
  export let rows;
  export let parentSuggest;
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
        data: parentSuggest,
        extract: item => item.name,
      },
      autocompleteValue: row => row.parent_name,
    }
  ];

  const updateFromCell = crud.updateFromCell('languages');

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
  {editable}
  on:update={handleUpdate}
/>