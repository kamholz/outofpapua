<script>
  import Table from '$components/Table.svelte';

  export let rows;
  export let editable;

  const columns = [
    {
      key: 'title',
      title: 'Title',
      editable: true,
    },
    {
      key: 'language',
      title: 'Language',
    },
    {
      key: 'reference',
      title: 'Reference',
      editable: true,
    }
  ];
</script>

<Table
  {columns}
  {rows} 
  {editable} 
/>