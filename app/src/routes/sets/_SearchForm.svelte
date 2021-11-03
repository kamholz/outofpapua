<script>
  import Form from '$components/Form.svelte';
  import RegexHelp from '$components/RegexHelp.svelte';
  import { getContext } from 'svelte';

  export let query;
  const setAuthorSuggest = getContext('setAuthorSuggest');
  const sourceSuggest = getContext('sourceSuggest');
  const langSuggest = getContext('langSuggest');
  const glosslangSuggest = getContext('glosslangSuggest');
  const preferences = getContext('preferences');
  const values = { ...query };

  const fields = [
    {
      name: 'headword',
      label: 'Headword',
      type: 'text',
      checkbox: ['headword_exact', 'Exact'],
    },
    {
      name: 'headword_ipa',
      label: 'IPA',
      type: 'text',
      checkbox: ['headword_ipa_exact', 'Exact'],
    },
    {
      name: 'gloss',
      label: 'Gloss',
      type: 'text',
    },
    {
      name: 'note',
      label: 'Note',
      type: 'text',
    },
    {
      name: 'author_id',
      label: 'Set Author',
      type: 'suggest',
      options: setAuthorSuggest,
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
  {values}
  submitLabel="Search"
  clearable
  browserSubmit
  help={RegexHelp}
  style="--form-width: 40em; --label-width: 23%; --checkbox-width: 5em;"
>
  <svelte:fragment slot="hidden">
    <input type="hidden" name="pagesize" value={$preferences.tablePageSize}>
  </svelte:fragment>
</Form>
