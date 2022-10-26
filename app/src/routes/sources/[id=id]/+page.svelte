<script>
  import EditSourceForm from './EditForm.svelte';
  import { page } from '$app/stores';
  import { setContext } from 'svelte';

  export let source;
  export let protolangSuggest = null;
  export let ipaConversionRuleSuggest = null;
  if (protolangSuggest) {
    setContext('protolangSuggest', protolangSuggest);
  }
  if (ipaConversionRuleSuggest) {
    setContext('ipaConversionRuleSuggest', ipaConversionRuleSuggest);
  }

  $: init(), $page;

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
<EditSourceForm {source} />

<div>
  <a href="/sources/{source.id}/entries">View Entries</a>
</div>

<style>
  div {
    margin-block-start: var(--item-sep);
  }
</style>