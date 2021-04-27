<script>
  import Form from '$components/Form.svelte';
  import { preferences } from '$stores';

  export let query;
  export let langSuggest;
  export let glosslangSuggest;

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
    {
      name: 'lang',
      label: 'Languages',
      type: 'languages',
      options: langSuggest,
    },
    {
      name: 'glosslang',
      label: 'Gloss languages',
      type: 'languages',
      options: glosslangSuggest,
    }
  ];
</script>

<Form
  {fields}
  values={query}
  submitLabel="Search"
  preventDefault={false}
  style="--formwidth: 30em; --gridtemplate: 30% 70%"
>
  <svelte:fragment slot="hidden">
    <input type="hidden" name="pagesize" value={$preferences.pagesize}>
  </svelte:fragment>
</Form>