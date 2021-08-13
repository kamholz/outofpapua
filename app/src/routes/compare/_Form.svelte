<script>
  import Form from '$components/Form.svelte';
  import RegexHelp from '$components/RegexHelp.svelte';
  import { getContext } from 'svelte';
  import { preferences } from '$lib/stores';

  export let query;
  const langSuggest = getContext('langSuggest');
  const glosslangSuggest = getContext('glosslangSuggest');
  let selections = {};

  const fields = [
    {
      name: 'lang1',
      label: 'Language 1',
      type: 'suggest',
      options: langSuggest,
    },
    {
      name: 'lang2',
      label: 'Language 2',
      type: 'suggest',
      options: langSuggest,
    },
    {
      name: 'gloss',
      label: 'Gloss',
      type: 'text',
    },
    {
      name: 'glosslang',
      label: 'Gloss languages',
      type: 'suggestMulti',
      options: glosslangSuggest,
    },
  ];

  function handleValidation(e) {
    const { form, values } = e.detail;
    const [lang1, , lang2] = form.elements;
    lang1.setCustomValidity('');
    lang2.setCustomValidity('');
    if (!values.lang1) {
      lang1.setCustomValidity('Language 1 is required');
    }
    if (!values.lang2) {
      lang2.setCustomValidity('Language 2 is required');
    }
    if (values.lang1 === values.lang2) {
      lang2.setCustomValidity('Language 2 cannot be the same as Language 1');
    }
  }
</script>

<Form
  {fields}
  values={query}
  bind:selections
  submitLabel="Compare"
  clearable
  browserSubmit
  help={RegexHelp}
  style="--formwidth: 35em; --gridtemplate: 32% 68%"
  on:beforesubmit={handleValidation}
>
  <svelte:fragment slot="hidden">
    <input type="hidden" name="pagesize" value={$preferences.listPageSize}>
  </svelte:fragment>

  <svelte:fragment slot="buttons">
    <button
      type="button"
      on:click={() => [selections.lang1, selections.lang2] = [selections.lang2, selections.lang1]}
    >Swap Languages</button>
  </svelte:fragment>
</Form>