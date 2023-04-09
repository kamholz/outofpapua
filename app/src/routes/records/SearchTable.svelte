<script>
  import EntryRecordFormatted from '$components/EntryRecord/Formatted.svelte';
  import EntryRecordHighlighted from '$components/EntryRecord/Highlighted.svelte';
  import Table from '$components/Table.svelte';
  import { getContext } from 'svelte';
  import { hideComparative } from '$lib/stores';

  export let rows;
  export let query;
  export let pageCount;
  const preferences = getContext('preferences');

  const columns = [
    {
      key: 'language_name',
      sortKey: 'language',
      title: 'Language',
    },
    {
      key: 'source_reference',
      sortKey: 'source',
      title: 'Source',
      link: (row) => `/sources/${row.source_id}/entries?pagesize=${$preferences.tablePageSize}`,
    },
    {
      key: 'headword',
      title: 'Headword',
      link: (row) => !row.source_editable && row.record_id && `/records/${row.record_id}`,
      class: (row) => row.origin,
    },
    {
      key: 'headword_ipa',
      title: 'IPA',
    },
  ];

  const controlsAll = [
    {
      type: 'set',
    },
    {
      type: 'entryinfo',
      comparative: true,
    },
  ];

  $: controls = $hideComparative
    ? controlsAll.filter((control) => !control.comparative)
    : controlsAll;
</script>

<Table
  {columns}
  {rows}
  {query}
  {controls}
  sortable
  paginated
  {pageCount}
  highlight
  searchContext={Boolean(query.record || query.record_marker)}
  searchContextCollapsed={(row) => row.seen_record}
  let:row
  on:link
>
  <EntryRecordHighlighted strings={row.record_match} showUnmatchedEntries>
    <EntryRecordFormatted
      data={row.record_data}
      source={{ id: row.source_id, formatting: row.source_formatting }}
      compact
    />
  </EntryRecordHighlighted>
</Table>
