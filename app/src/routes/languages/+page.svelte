<script>
  import CreateForm from './CreateForm.svelte';
  import SearchForm from './SearchForm.svelte';
  import Table from './Table.svelte';
  import { getContext, setContext } from 'svelte';
  import { goto, invalidateAll } from '$app/navigation';
  import { isEditor } from '$lib/util';
  import { pageLoading, session } from '$lib/stores';

  export let data;
  $: ({
    query,
    rows,
  } = data);
  const { dialectLangSuggest, protolangSuggest, regionSuggest } = data;
  setContext('protolangSuggest', protolangSuggest);
  if (dialectLangSuggest) {
    setContext('dialectLangSuggest', dialectLangSuggest);
  }
  if (regionSuggest) {
    setContext('regionSuggest', regionSuggest);
  }
  const editable = getContext('editable');
  let showLanguagesWithNoEntries = false;

  async function handleRefresh() {
    $pageLoading++;
    await invalidateAll();
    $pageLoading--;
  }

  function handleChangeEditorMode(e) {
    const currentUrl = new URL(window.location);
    currentUrl.searchParams.set('editor_mode', e.target.checked ? '1' : '0');
    goto(currentUrl, { replaceState: true });
  }
</script>

<svelte:head>
  <title>Languages | Out of Papua</title>
</svelte:head>

<h2>Languages</h2>
<div>
  <a href="/languages/map">View map of languages</a>
</div>
{#if $session.user}
  <div>
    <a href="/languages/export_proto">Export reconstructions</a>
  </div>
{/if}
<SearchForm {query} />

{#if editable}
  <form>
    <input type="checkbox" id="editable" checked={query.editor_mode} on:change={handleChangeEditorMode} />
    <label for="editable">Enable Editor Mode</label>
  </form>
{/if}

<div class="info">
  Number of languages: {rows.length}
</div>
<Table
  {rows}
  {query}
  {showLanguagesWithNoEntries}
  on:refresh={handleRefresh}
/>

{#if !query.editor_mode && isEditor($session.user)}
  <form>
    <input type="checkbox" id="showLanguagesWithNoEntries" bind:checked={showLanguagesWithNoEntries} />
    <label for="showLanguagesWithNoEntries">Show Languages With No Entries</label>
  </form>
{/if}

{#if editable}
  <h3>Create proto-language</h3>
  <CreateForm
    type="proto"
    on:refresh={handleRefresh}
  />
  {#if isEditor($session.user)}
    <h3>Create dialect</h3>
    <CreateForm
      type="dialect"
      on:refresh={handleRefresh}
    />
    <h3>Create language with no ISO code</h3>
    <CreateForm
      type="lang"
      on:refresh={handleRefresh}
    />
  {/if}
{/if}

<style>
  div {
    margin-block-end: 24px;
  }

  form {
    margin-block-start: 18px;
    margin-block-end: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .info {
    margin-block: var(--item-sep);
  }
</style>
