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
<Table
  {rows}
  {query}
  on:refresh={handleRefresh}
/>

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
  {/if}
{/if}

<style>
  div {
    margin-block-end: 24px;
  }
</style>