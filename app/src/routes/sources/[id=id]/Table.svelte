<script>
  import Alert from '$components/Alert.svelte';
  import EntryRecordFormatted from '$components/EntryRecord/Formatted.svelte';
  import EntryRecordHighlighted from '$components/EntryRecord/Highlighted.svelte';
  import Table from '$components/Table.svelte';
  import { getContext } from 'svelte';
  import { hideComparative, pageLoading } from '$lib/stores';
  import { joinGlosses, parseGlosses } from '$lib/util';
  import * as crud from '$actions/crud';
  import * as crudSense from '$actions/crud/sense';

  let {
    rows,
    query,
    source,
    pageCount
  } = $props();
  const editable = getContext('editable');

  const columns = [
    {
      key: 'headword',
      title: 'Headword',
      link: !source.editable && ((row) => row.record_id && `/records/${row.record_id}`),
      class: (row) => row.origin,
      editable: true,
    },
    {
      key: 'headword_ipa',
      title: 'IPA',
    },
    {
      key: 'senses',
      title: 'Glosses',
      type: 'senses',
      multiGlosslang: !source.editable,
      editable: true,
      inputValue: (row) => joinGlosses(row.senses[0]?.glosses?.[0]?.txt ?? []),
    },
  ];

  const controlsAll = [
    {
      type: 'set',
      comparative: true,
    },
    {
      type: 'entryinfo',
      comparative: true,
    },
  ];

  let controls = $derived($hideComparative
    ? controlsAll.filter((control) => !control.comparative)
    : controlsAll);

  const updateFromCell = crud.updateFromCell('entry');
  let promise = $state();

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

{#await promise catch {message }}
  <Alert type="error">{message}</Alert>
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
  highlight
  searchContext={Boolean(query.record)}
  
  on:update={handleUpdate}
  on:link
>
  {#snippet children({ row })}
    <EntryRecordHighlighted strings={row.record_match}>
      <EntryRecordFormatted
        data={row.record_data}
        source={{ id: row.source_id, formatting: row.source_formatting }}
        compact
      />
    </EntryRecordHighlighted>
  {/snippet}
</Table>
