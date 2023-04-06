<script>
  import Form from '$components/Form.svelte';
  import RegexHelp from '$components/RegexHelp.svelte';
  import { getContext } from 'svelte';

  export let query;
  const sourceSuggest = getContext('sourceSuggest');
  const langSuggest = getContext('langSuggest');
  const regionSuggest = getContext('regionSuggest');
  const preferences = getContext('preferences');
  const values = { ...query };

  const fields = [
    {
      name: 'record_marker',
      label: 'Toolbox marker',
      type: 'text',
    },
    {
      name: 'record',
      label: 'Marker value',
      type: 'text',
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
      name: 'region',
      label: 'Region',
      type: 'suggest',
      options: regionSuggest,
      svelecteProps: { valueField: 'name' },
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
  style="--form-width: 40em; --label-width: 23.5%; --checkbox-width: 5em;"
>
  <svelte:fragment slot="hidden">
    <input type="hidden" name="pagesize" value={$preferences.tablePageSize}>
  </svelte:fragment>
</Form>
