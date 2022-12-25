<script>
  import Form from '$components/Form.svelte';
  import RegexHelp from '$components/RegexHelp.svelte';
  import { getContext } from 'svelte';
  import { hideComparative } from '$lib/stores';

  export let query;
  const langSuggest = getContext('langSuggest');
  const glosslangSuggest = getContext('glosslangSuggest');
  const borrowlangSuggest = getContext('borrowlangSuggest');
  const preferences = getContext('preferences');
  const values = { ...query };

  const fieldsAll = [
    {
      name: 'headword',
      label: 'Headword',
      type: 'text',
      checkbox: ['headword_exact', 'Exact'],
      hotkey: 'h',
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
      hotkey: 'g',
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
        { label: 'Mixed', value: 'mixed' },
        { label: 'Unspecified', value: 'unspecified' },
        { label: 'All', value: 'all' },
      ],
      comparative: true,
    },
    {
      name: 'borrowlang',
      label: 'Borrowed from',
      type: 'suggestMulti',
      options: borrowlangSuggest,
      hide: values.origin !== 'borrowed',
      comparative: true,
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
      comparative: true,
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

  $: fields = $hideComparative
    ? fieldsAll.filter((field) => !field.comparative)
    : fieldsAll;

  function handleChange(e) {
    if (e.target.name === 'origin') {
      fields[5].hide = e.target.value !== 'borrowed';
    }
  }
</script>

<Form
  {fields}
  {values}
  submitLabel="Search"
  clearable
  browserSubmit
  help={RegexHelp}
  style="--form-width: 40em; --label-width: 23.5%; --checkbox-width: 5em;"
  on:change={handleChange}
>
  <svelte:fragment slot="hidden">
    <input type="hidden" name="pagesize" value={$preferences.tablePageSize}>
  </svelte:fragment>
</Form>
