<script>
  import Form from '$components/Form.svelte';
  import Record from '$components/Record.svelte';

  export let source;
  export let editable;

  const fields = [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
    },
    {
      name: 'language_name',
      label: 'Language',
      type: 'text',
      uneditable: !source.is_proto,
    },
    {
      name: 'numentries',
      label: '# Entries',
      type: 'text',
      uneditable: true,
    },
    {
      name: 'reference',
      label: 'Short Reference',
      type: 'text',
      required: true,
    },
    {
      name: 'reference_full',
      label: 'Full Reference',
      type: 'textarea',
    },
    {
      name: 'note',
      label: 'Note',
      type: 'textarea',
    },
  ];
</script>

{#if editable}
  <Form
    {fields}
    values={source}
    submitLabel="Save"
    style="--formwidth: 35em; --gridtemplate: 30% 70%"
  />
{:else}
  <Record
    {fields}
    values={source}
    style="--recordwidth: 35em; --gridtemplate: 30% 70%"
  />
{/if}