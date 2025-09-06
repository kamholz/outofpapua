<script>
  import Form from '$components/Form.svelte';

  export let lib;

  const fields = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
    },
    {
      name: 'code',
      label: 'Code',
      type: 'textarea',
    },
  ];
</script>

<Form
  {fields}
  values={lib}
  submitLabel="Save"
  on:submit
  style="--form-width: 50em; --label-width: 18%;"
/>
