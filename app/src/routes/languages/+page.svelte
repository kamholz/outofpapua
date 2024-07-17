<script>
  import CreateForm from './CreateForm.svelte';
  import Table from './Table.svelte';
  import { getContext, setContext } from 'svelte';
  import { invalidateAll } from '$app/navigation';
  import { isEditor } from '$lib/util';
  import { pageLoading, session } from '$lib/stores';

  export let data;
  $: ({
    query,
    rows,
  } = data);
  const { langSuggest } = data;
  if (langSuggest) {
    setContext('langSuggest', langSuggest);
  }
  const editable = getContext('editable');
  let showLanguagesWithNoEntries = false;

  async function handleRefresh() {
    $pageLoading++;
    await invalidateAll();
    $pageLoading--;
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
<Table
  {rows}
  {query}
  {showLanguagesWithNoEntries}
  on:refresh={handleRefresh}
/>

{#if isEditor($session.user)}
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
</style>