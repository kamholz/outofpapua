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
    }
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
    {#if $settings.include_descendants}
      <input type="hidden" name="include_descendants" value="1">
    {/if}
    {#if $settings.include_borrowed}
      <input type="hidden" name="include_borrowed" value="1">
    {/if}
    {#if $settings.include_ancestors}
      <input type="hidden" name="include_ancestors" value="1">
    {/if}
  </svelte:fragment>
</Form>