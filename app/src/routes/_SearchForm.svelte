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
      name: 'category',
      label: 'Include',
      type: 'radio',
      options: [
        { label: 'Languages', value: 'lang' },
        { label: 'Proto-languages', value: 'proto' },
        { label: 'Both', value: 'both' },
      ]
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
    },
  ]
</script>

<Form
  {fields}
  values={query}
  submitLabel="Search"
  browserSubmit
  style="--formwidth: 33em; --gridtemplate: 32% 68%"
>
  <svelte:fragment slot="hidden">
    <input type="hidden" name="pagesize" value={$preferences.pagesize}>
  </svelte:fragment>
</Form>