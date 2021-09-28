<script>
  import Form from '$components/Form.svelte';
  import RegexHelp from '$components/RegexHelp.svelte';
  import { getContext } from 'svelte';

  export let query;
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
      name: 'set',
      label: 'Set',
      type: 'radio',
      options: [
        { label: 'Linked', value: 'linked' },
        { label: 'Unlinked', value: 'unlinked' },
        { label: 'Both', value: 'both' },
      ],
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
  style="--form-width: 40em; --label-width: 25%; --checkbox-width: 5em;"
>
  <svelte:fragment slot="hidden">
    <input type="hidden" name="pagesize" value={$preferences.tablePageSize}>
  </svelte:fragment>
</Form>
