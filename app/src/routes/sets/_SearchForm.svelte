<script>
  import Form from '$components/Form.svelte';
  import { preferences } from '$lib/stores';

  export let query;
  export let langSuggest;
  export let glosslangSuggest;

  const fields = [
    {
      name: 'lang',
      label: 'Languages',
      type: 'suggestMulti',
      options: langSuggest,
    },
    {
      name: 'glosslang',
      label: 'Gloss languages',
      type: 'suggestMulti',
      options: glosslangSuggest,
    },
  ];
</script>

<Form
  {fields}
  values={query}
  submitLabel="Search"
  browserSubmit
  style="--formwidth: 35em; --gridtemplate: 32% 68%"
>
  <svelte:fragment slot="hidden">
    <input type="hidden" name="pagesize" value={$preferences.pageSize}>
  </svelte:fragment>
</Form>
