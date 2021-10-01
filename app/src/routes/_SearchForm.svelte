<script>
  import Form from '$components/Form.svelte';
  import RegexHelp from '$components/RegexHelp.svelte';
  import { getContext } from 'svelte';

  export let query;
  const langSuggest = getContext('langSuggest');
  const glosslangSuggest = getContext('glosslangSuggest');
  const borrowlangSuggest = getContext('borrowlangSuggest');
  const preferences = getContext('preferences');
  const values = { ...query };
  const selections = {};

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
      name: 'record',
      label: 'Whole entry',
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
      name: 'borrowlang',
      label: 'Borrowed from',
      type: 'suggestMulti',
      options: borrowlangSuggest,
      hide: values.origin !== 'borrowed',
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

  function handleChange(e) {
    if (e.target.name === 'origin') {
      fields[5].hide = e.target.value !== 'borrowed';
      if (!fields[5].hide && !selections.borrowlang?.length) {
        selections.borrowlang = null;
      }
    }
  }
</script>

<Form
  {fields}
  {values}
  {selections}
  submitLabel="Search"
  clearable
  browserSubmit
  help={RegexHelp}
  style="--form-width: 40em; --label-width: 25%; --checkbox-width: 5em;"
  on:change={handleChange}
>
  <svelte:fragment slot="hidden">
    <input type="hidden" name="pagesize" value={$preferences.tablePageSize}>
  </svelte:fragment>
</Form>
