<script>
  import Form from '$components/Form.svelte';
  import RegexHelp from '$components/RegexHelp.svelte';
  import { preferences } from '$lib/stores';

  export let query;
  export let langSuggest;
  export let glosslangSuggest;

  const fields = [
    {
      name: 'lang1',
      label: 'Language 1',
      type: 'suggest',
      options: langSuggest,
    },
    {
      name: 'lang2',
      label: 'Language 2',
      type: 'suggest',
      options: langSuggest,
    },
    {
      name: 'gloss',
      label: 'Gloss',
      type: 'text',
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
  submitLabel="Compare"
  browserSubmit
  help={RegexHelp}
  style="--formwidth: 35em; --gridtemplate: 32% 68%"
>
  <svelte:fragment slot="hidden">
    <input type="hidden" name="pagesize" value={$preferences.listPageSize}>
  </svelte:fragment>
</Form>