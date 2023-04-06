<script>
  import EntryRecordFormatted from '$components/EntryRecord/Formatted.svelte';
  import EntryRecordHighlighted from '$components/EntryRecord/Highlighted.svelte';
  import Table from '$components/Table.svelte';
  import { getContext } from 'svelte';

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
  ];

  const controls = [
    {
      type: 'view',
      link: (row) => `/records/${row.id}`,
    },
  ];
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
  let:row
>
  <EntryRecordHighlighted strings={row.record_match} showUnmatchedEntries>
    <EntryRecordFormatted
      data={row.record_data}
      source={{ id: row.source_id, formatting: row.source_formatting }}
      compact
    />
  </EntryRecordHighlighted>
</Table>
