<script>
  import Form from '$components/Form.svelte';

  export let rule;

  const fields = [
    {
      name: 'lowercase',
      label: 'Lowercase',
      type: 'checkbox',
    },
    {
      name: 'chain_before',
      label: 'Chain Before',
      type: 'textarea',
    },
    {
      name: 'function',
      label: 'Function Before',
      type: 'textarea',
    },
    {
      name: 'replacements',
      label: 'Replacements',
      type: 'textarea',
    },
    {
      name: 'chain_after',
      label: 'Chain After',
      type: 'textarea',
    },
    {
      name: 'lib',
      label: 'Lib',
      type: 'textarea',
    },
  ];
</script>

<Form
  {fields}
  values={rule}
  submitLabel="Save"
  on:submit
  style="--form-width: 50em; --label-width: 18%;"
/>