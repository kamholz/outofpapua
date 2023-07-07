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
    {#if $settings.descendants}
      <input type="hidden" name="descendants" value="1">
    {/if}
    {#if $settings.borrowed}
      <input type="hidden" name="borrowed" value="1">
    {/if}
    {#if $settings.ancestors}
      <input type="hidden" name="ancestors" value="1">
    {/if}
  </svelte:fragment>
</Form>