<script>
  import Form from '$components/Form.svelte';
  import { getContext } from 'svelte';

  export let query;
  const protolangSuggest = getContext('protolangSuggest');
  const values = { ...query };

  const fields = [
    {
      name: 'protolang',
      label: 'Proto-languages',
      type: 'suggestMulti',
      options: protolangSuggest,
    },
  ];
</script>

<Form
  {fields}
  {values}
  submitLabel="Search"
  clearable
  browserSubmit
  style="--form-width: 40em; --label-width: 23%"
/>