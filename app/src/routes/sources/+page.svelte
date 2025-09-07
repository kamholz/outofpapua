<script>
  import CreateForm from './CreateForm.svelte';
  import SearchForm from './SearchForm.svelte';
  import Table from './Table.svelte';
  import { getContext, setContext } from 'svelte';
  import { invalidateAll } from '$app/navigation';
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
</script>

<svelte:head>
  <title>Sources | Out of Papua</title>
</svelte:head>

<h2>Sources</h2>
<SearchForm {query} />

<div class="info">
  Sources: {rows.length}
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
  .info {
    margin-block: var(--item-sep);
  }
</style>