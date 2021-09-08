<script>
  import Form from '$components/Form.svelte';
  import RegexHelp from '$components/RegexHelp.svelte';
  import { getContext } from 'svelte';

  export let query;
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
      name: 'headword_ipa',
      label: 'IPA',
      type: 'text',
    },
    {
      name: 'gloss',
      label: 'Gloss',
      type: 'text',
    },
    {
      name: 'origin',
      label: 'Origin',
      type: 'radio',
      options: [
        { label: 'Inherited', value: 'inherited' },
        { label: 'Borrowed', value: 'borrowed' },
        { label: 'Unknown', value: 'unknown' },
        { label: 'All', value: 'all' },
      ],
    },
    {
      name: 'set',
      label: 'Set',
      type: 'radio',
      options: [
        { label: 'Linked', value: 'linked' },
        { label: 'Unlinked', value: 'unlinked' },
        { label: 'Both', value: 'both' },
      ],
    },
    {
      name: 'langcat',
      label: 'Language type',
      type: 'radio',
      options: [
        { label: 'Languages', value: 'lang' },
        { label: 'Proto-languages', value: 'proto' },
        { label: 'Both', value: 'both' },
      ],
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
  style="--formwidth: 35em; --gridtemplate: 32% 68%"
>
  <svelte:fragment slot="hidden">
    <input type="hidden" name="pagesize" value={$preferences.tablePageSize}>
  </svelte:fragment>
</Form>
