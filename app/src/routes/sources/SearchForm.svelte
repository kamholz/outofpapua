<script>
  import Form from '$components/Form.svelte';
  import { getContext } from 'svelte';

  let { query } = $props();
  const langSuggest = getContext('langSuggest');
  const values = { ...query };

  const fields = [
    {
      name: 'lang',
      label: 'Languages',
      type: 'suggestMulti',
      options: langSuggest,
    },
  ];
</script>

<Form
  {fields}
  {values}
  submitLabel="Search"
  clearable
  browserSubmit
  style="--form-width: 40em; --label-width: 20%"
/>