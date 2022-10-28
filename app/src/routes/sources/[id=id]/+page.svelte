<script>
  import Alert from '$components/Alert.svelte';
  import EditForm from './EditForm.svelte';
  import { checkError, isEditor } from '$lib/util';
  import { page } from '$app/stores';
  import { pageLoading, session } from '$lib/stores';
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

  let promise;

  $: init($page);

  function init() {
    if (source.formatting && typeof source.formatting === 'object') {
      source.formatting = JSON.stringify(source.formatting);
    }
  }

  async function handleRule() {
    $pageLoading++;
    try {
      promise = (async () => {
        const res = await fetch(`/api/source/${source.id}/convert`, { method: 'POST' });
        checkError(res);
      })();
      await promise;
    } catch (e) {}
    $pageLoading--;
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

{#if isEditor($session.user)}
  <div>
    <a href="/ipa_conversion_rules/{source.ipa_conversion_rule}">Edit IPA Conversion Ruleset</a>
  </div>

  <div>
    <button on:click={handleRule} disabled={$pageLoading}>Run IPA Conversion</button>
  </div>
  {#if promise}
    {#await promise then}
      <Alert type="success" message="Conversion successful" />
    {:catch { message }}
      <Alert type="error" {message} />
    {/await}
  {/if}
{/if}

<style>
  div {
    margin-block-start: var(--item-sep);
  }
</style>