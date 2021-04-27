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
    },
    // {
    //   name: 'glosslang',
    //   label: 'Gloss languages',
    //   type: 'multiselect',
    // }
  ];
</script>

<Form
  {fields}
  values={query}
  submitLabel="Search"
  preventDefault={false}
  style="--formwidth: 22em; --gridtemplate: 40% 60%"
>
  <svelte:fragment slot="hidden">
    <input type="hidden" name="pagesize" value={$preferences.pagesize}>
  </svelte:fragment>
</Form>