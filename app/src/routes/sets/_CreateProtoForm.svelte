<script>
  import Form from '$components/Form.svelte';
  
  export let sourceSuggest;
  export let values;

  const fields = [
    {
      name: 'source',
      label: 'Source',
      type: 'suggest',
      options: sourceSuggest,
      required: true,
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

  function handleBeforeSubmit(e) {
    const { form } = e.detail;
    form.elements[0].setCustomValidity(values.source ? '' : 'Source is required.');
  }
</script>

<Form
  {fields}
  bind:values
  submitLabel="Create"
  on:beforesubmit={handleBeforeSubmit}
  on:submit
/>
