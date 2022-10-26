<script>
  import EditForm from './EditForm.svelte';
  import { page } from '$app/stores';
  import { setContext } from 'svelte';

  export let data;
  $: ({ source } = data);
  const {
    langSuggest,
    protolangSuggest,
    ipaConversionRuleSuggest,
  } = data;
  if (langSuggest) {
    setContext('langSuggest', langSuggest);
  }
  if (protolangSuggest) {
    setContext('protolangSuggest', protolangSuggest);
  }
  if (ipaConversionRuleSuggest) {
    setContext('ipaConversionRuleSuggest', ipaConversionRuleSuggest);
  }

  $: init($page);

  function init() {
    if (source.formatting && typeof source.formatting === 'object') {
      source.formatting = JSON.stringify(source.formatting);
    }
  }
</script>

<svelte:head>
  <title>Source: {source.reference} | Out of Papua</title>
</svelte:head>

<h3>Source: {source.reference}</h3>
<EditForm {source} />

<div>
  <a href="/sources/{source.id}/entries">View Entries</a>
</div>

<style>
  div {
    margin-block-start: var(--item-sep);
  }
</style>