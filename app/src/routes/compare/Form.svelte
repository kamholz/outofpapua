<script>
  import Form from '$components/Form.svelte';
  import RegexHelp from '$components/RegexHelp.svelte';
  import { getContext } from 'svelte';

  export let query;
  const langSuggest = getContext('langSuggest');
  const glosslangSuggest = getContext('glosslangSuggest');
  const preferences = getContext('preferences');
  let values = { ...query };

  const fields = [
    {
      name: 'lang1',
      label: 'Language(s) 1',
      type: 'suggestMulti',
      options: langSuggest,
    },
    {
      name: 'lang2',
      label: 'Language(s) 2',
      type: 'suggestMulti',
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
    {
      name: 'loose',
      label: 'Looser matching',
      type: 'checkbox',
    },
];

  function handleValidation(e) {
    const { form, values } = e.detail;
    const [lang1, , lang2] = form.elements;
    lang1.setCustomValidity('');
    lang2.setCustomValidity('');
    if (!values.lang1.length) {
      lang1.setCustomValidity('Language 1 is required');
    }
    if (!values.lang2.length) {
      lang2.setCustomValidity('Language 2 is required');
    }
    // if (values.lang1 === values.lang2) {
    //   lang2.setCustomValidity('Language 2 cannot be the same as Language 1');
    // }
  }

  function swapLanguages() {
    const { lang1, lang2 } = values;
    values.lang1 = lang2;
    values.lang2 = lang1;
  }
</script>

<Form
  {fields}
  bind:values
  submitLabel="Compare"
  clearable
  browserSubmit
  style="--form-width: 35em; --label-width: 30%;"
  on:beforesubmit={handleValidation}
>
  <svelte:fragment slot="hidden">
    <input type="hidden" name="pagesize" value={$preferences.listPageSize}>
  </svelte:fragment>

  <svelte:fragment slot="buttons">
    <button
      type="button"
      on:click={swapLanguages}
    >Swap Languages</button>
  </svelte:fragment>

  <svelte:fragment slot="controls">
    <RegexHelp />
  </svelte:fragment>
</Form>