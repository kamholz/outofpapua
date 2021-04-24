<script>
  import Table from '$components/Table.svelte';

  export let rows;

  const columns = [
    {
      key: 'language',
      title: 'Language',
    },
    {
      key: 'headword',
      title: 'Headword',
    },
    {
      key: 'pos',
      title: 'POS',
    },
    {
      key: 'gloss',
      title: 'Gloss',
    },
    {
      key: 'gloss_language',
      title: 'Gloss Language',
    }
  ];
</script>

<Table
  {columns}
  {rows} 
/>