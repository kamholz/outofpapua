<script>
  import Alert from '$components/Alert.svelte';
  import Table from '$components/Table.svelte';
  import { entryUrl, joinGlosses, parseGlosses } from '$lib/util';
  import { pageLoading } from '$lib/stores';
  import * as crud from '$actions/crud';
  import * as crudSense from '$actions/crud/sense';

  export let rows;
  export let query;
  export let editable;
  export let source;
  export let pageCount;
  export let borrowlangSuggest;

  const columns = [
    {
      key: 'headword',
      title: 'Headword',
      link: !source.editable && entryUrl,
      // linkClass: (row) => row.origin,
      editable: true,
    },
    {
      key: 'senses',
      title: 'Glosses',
      type: 'senses',
      multilang: !source.editable,
      editable: true,
      inputValue: (row) => joinGlosses(row.senses[0]?.glosses?.[0]?.txt ?? []),
    },
  ];

  const controls = [
    {
      type: 'set',
    },
    {
      type: 'entryinfo',
      editable,
      borrowlangSuggest,
    },
  ];

  const updateFromCell = crud.updateFromCell('entry');
  let promise;

  async function handleUpdate(e) {
    const { key, row, onSuccess, values } = e.detail;
    $pageLoading++;
    try {
      if (key === 'headword') {
        promise = updateFromCell(e);
        await promise;
      } else {
        const glosses = parseGlosses(values.senses);
        promise = crudSense.update({
          entry_id: row.id,
          sense_id: row.senses[0].id,
          values: { glosses },
        }).then(() => {
          row.senses[0].glosses[0].txt = glosses;
          onSuccess(true);
        });
        await promise;
      }
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
  editable={editable && source.editable}
  {controls}
  sortable
  paginated
  {pageCount}
  on:update={handleUpdate}
/>
