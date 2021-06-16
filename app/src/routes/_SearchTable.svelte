<script>
  import Table from '$components/Table.svelte';

  export let rows;
  export let query;
  export let pageCount;
  export let editable;
  export let linkable;
  export let borrowlangSuggest;

  const columns = [
    {
      key: 'language',
      title: 'Language',
    },
    {
      key: 'source',
      title: 'Source',
    },
    {
      key: 'headword',
      title: 'Headword',
      link: (row) => !row.source_editable && row.record_id && `/records/${row.record_id}`,
      class: (row) => row.origin,
    },
    {
      key: 'senses',
      title: 'Glosses',
      type: 'senses',
      multilang: !(query.glosslang?.length === 1),
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

  if (linkable) {
    controls.push({
      type: 'select',
    });
  }
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
/>
