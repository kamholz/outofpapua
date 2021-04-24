<script context="module">
  export async function load({ fetch, session }) {
    const props = {
      editable: session.user !== null
    };
    const res = await fetch('/api/sources.json');
    if (!res.ok) {
      return { status: 500, error: 'Internal error' };
    }
    props.rows = await res.json();
    return { props };
  }
</script>

<script>
  import DictionaryTable from '$components/tables/DictionaryTable.svelte';

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

<main>
  <h2>Dictionaries</h2>
  <DictionaryTable
    {columns}
    {rows} 
    {editable} 
  />
</main>
