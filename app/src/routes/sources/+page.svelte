<script>
  import CreateForm from './CreateForm.svelte';
  import Table from './Table.svelte';
  import { getContext, setContext } from 'svelte';
  import { reload } from './+page';

  export let data;
  $: ({
    rows,
    query,
  } = data);
  const { protolangSuggest } = data;
  if (protolangSuggest) {
    setContext('protolangSuggest', protolangSuggest);
  }
  const editable = getContext('editable');

  async function handleRefresh() {
    rows = (await reload(fetch, query))?.rows;
  }
</script>

<svelte:head>
  <title>Sources | Out of Papua</title>
</svelte:head>

<h2>Sources</h2>
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
