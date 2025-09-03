<script>
  import Form from '$components/Form.svelte';
  import { getContext } from 'svelte';

  export let query;
  const protolangSuggest = getContext('protolangSuggest');
  const settings = getContext('settings');
  const values = { ...query };

  const fields = [
    {
      name: 'protolang',
      label: 'Proto-language',
      type: 'suggest',
      options: protolangSuggest,
    },
  ];
</script>

<Form
  {fields}
  {values}
  submitLabel="Export"
  clearable
  browserSubmit
  style="--form-width: 45em; --label-width: 23%; --checkbox-width: 7em;"
>
  <svelte:fragment slot="hidden">
    {#each Object.entries($settings) as [key, value]}
      <input type="hidden" name={key} value={value ? 1 : 0}>
    {/each}
  </svelte:fragment>
</Form>
