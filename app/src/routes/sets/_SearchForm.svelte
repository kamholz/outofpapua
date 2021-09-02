<script>
  import Form from '$components/Form.svelte';
  import RegexHelp from '$components/RegexHelp.svelte';
  import { getContext } from 'svelte';

  export let query;
  const sourceSuggest = getContext('sourceSuggest');
  const langSuggest = getContext('langSuggest');
  const glosslangSuggest = getContext('glosslangSuggest');
  const preferences = getContext('preferences');

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
      name: 'source',
      label: 'Sources',
      type: 'suggestMulti',
      options: sourceSuggest,
    },
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
  clearable
  browserSubmit
  help={RegexHelp}
  style="--formwidth: 45em; --gridtemplate: 32% 68%"
>
  <svelte:fragment slot="hidden">
    <input type="hidden" name="pagesize" value={$preferences.tablePageSize}>
  </svelte:fragment>
</Form>
