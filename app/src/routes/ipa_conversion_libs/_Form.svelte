<script>
  import Form from '$components/Form.svelte';

  export let lib;

  const fields = [
    {
      name: 'code',
      label: 'Code',
      type: 'textarea',
    }
  ];
</script>

<Form
  {fields}
  values={lib}
  submitLabel="Save"
  on:submit
  style="--formwidth: 50em; --gridtemplate: 20% 80%;"
/>