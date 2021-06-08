<script>
  import Form from '$components/Form.svelte';
  
  export let sourceSuggest;

  const fields = [
    {
      name: 'source',
      label: 'Source',
      type: 'source',
      options: sourceSuggest,
    },
    {
      name: 'headword',
      label: 'Headword',
      type: 'text',
      required: true,
    },
    {
      name: 'gloss',
      label: 'English Glosses',
      type: 'text',
      required: true,
    },
  ];
</script>

<Form
  {fields}
  submitLabel="Create"
/>
