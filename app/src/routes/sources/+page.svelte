<script>
  import CreateForm from './CreateForm.svelte';
  import SearchForm from './SearchForm.svelte';
  import Table from './Table.svelte';
  import { getContext, setContext } from 'svelte';
  import { goto, invalidateAll } from '$app/navigation';
  import { pageLoading } from '$lib/stores';

  export let data;
  $: ({
    rows,
    query,
  } = data);
  const {  langSuggest, protolangSuggest } = data;
  setContext('langSuggest', langSuggest);
  if (protolangSuggest) {
    setContext('protolangSuggest', protolangSuggest);
  }
  const editable = getContext('editable');

  async function handleRefresh() {
    $pageLoading++;
    await invalidateAll();
    $pageLoading--;
  }

  function handleChangeEditMode(e) {
    const currentUrl = new URL(window.location);
    currentUrl.searchParams.set('edit_mode', e.target.checked ? '1' : '0');
    goto(currentUrl, { replaceState: true });
  }
</script>

<svelte:head>
  <title>Sources | Out of Papua</title>
</svelte:head>

<h2>Sources</h2>
<SearchForm {query} />

{#if editable}
  <form>
    <input type="checkbox" id="editable" checked={query.edit_mode} on:change={handleChangeEditMode} />
    <label for="editable">Enable Edit Mode</label>
  </form>
{/if}

<div class="info">
  Number of sources: {rows.length}
</div>

<Table
  {rows}
  {query}
/>

{#if editable}
  <h3>Create new proto-language source</h3>
  <CreateForm
    on:refresh={handleRefresh}
  />
{/if}

<style lang="scss">
  form {
    margin-block-start: 18px;
    margin-block-end: 24px;
    display: flex;
    gap: 12px;
  }

  .info {
    margin-block: var(--item-sep);
  }
</style>