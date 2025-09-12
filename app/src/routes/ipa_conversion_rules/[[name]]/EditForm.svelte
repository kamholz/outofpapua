<script>
  import Form from '$components/Form.svelte';
  import { escapeDiacritics, unescapeUnicode } from '$lib/util';

  let { rule = $bindable() } = $props();

  const fields = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
    },
    {
      name: 'lowercase',
      label: 'Lowercase',
      type: 'checkbox',
    },
    {
      name: 'chain_before',
      label: 'Chain Before',
      type: 'textarea',
    },
    {
      name: 'function',
      label: 'Function Before',
      type: 'textarea',
    },
    {
      name: 'replacements',
      label: 'Replacements',
      type: 'textarea',
    },
    {
      name: 'chain_after',
      label: 'Chain After',
      type: 'textarea',
    },
    {
      name: 'lib',
      label: '<a href="/ipa_conversion_libs">Lib</a>',
      type: 'textarea',
    },
  ];
</script>

<Form
  {fields}
  values={rule}
  submitLabel="Save"
  on:submit
  style="--form-width: 50em; --label-width: 18%;"
>
  {#snippet buttons()}
    <div >
      <button type="button"
        onclick={() => rule.replacements = unescapeUnicode(rule.replacements)}
      >Unescape All</button>
      <button type="button"
        onclick={() => rule.replacements = escapeDiacritics(rule.replacements)}
      >Escape Diacritics</button>
    </div>
  {/snippet}
</Form>

<style>
  div {
    display: flex;
  }
</style>
