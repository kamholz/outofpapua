<script>
  import Form from '$components/Form.svelte';

  export let query;

  const fields = [
    {
      name: 'headword',
      label: 'Headword',
      type: 'text',
    },
    {
      name: 'gloss',
      label: 'Gloss',
      type: 'text',
    }
  ];
</script>

<Form
  {fields}
  values={query}
  submitLabel="Search"
  preventDefault={false}
/>