<script>
  import Form from '$components/Form.svelte';
  import { preferences } from '$stores';

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
>
  <svelte:fragment slot="hidden">
    <input type="hidden" name="pagesize" value={$preferences.pagesize}>
  </svelte:fragment>
</Form>