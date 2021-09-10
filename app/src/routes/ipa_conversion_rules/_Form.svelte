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
    {
      name: 'function',
      label: 'Function',
      type: 'textarea',
    },
  ];
</script>

<Form 
  {fields}
  values={rule}
  submitLabel="Save"
  on:submit
  style="--formwidth: 50em; --gridtemplate: 20% 80%;"
/>