<script>
  import { run } from 'svelte/legacy';

  import Alert from '$components/Alert.svelte';
  import Form from './Form.svelte';
  import List from './List.svelte';
  import PageSizeSelect from '$components/PageSizeSelect.svelte';
  import { invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import { pageLoading, setSummaryCache } from '$lib/stores';
  import { setContext } from 'svelte';

  let { data } = $props();
  const {
    langSuggest,
    glosslangSuggest,
    borrowlangSuggest,
  } = data;
  setContext('langSuggest', langSuggest);
  setContext('glosslangSuggest', glosslangSuggest);
  if (borrowlangSuggest) {
    setContext('borrowlangSuggest', borrowlangSuggest);
  }

  const langNameById = Object.fromEntries(
    langSuggest.filter((v) => !v.plus).map((v) => [v.id, v.name])
  );
  setContext('langNameById', langNameById);


  setContext('setSummaryCache', setSummaryCache);


  function init() {
    $setSummaryCache = {};
  }

  async function handleRefresh() {
    $pageLoading++;
    await invalidateAll();
    $pageLoading--;
    init();
  }
  let {
    pageCount,
    query,
    rowCount,
    rows,
    error,
  } = $derived(data);
  let multiGlosslang = $derived(!(query.glosslang?.length === 1));
  let multiLang = $derived(!(query.lang1?.length === 1 && !query.lang1[0].match(/\+$/)));
  run(() => {
    init($page);
  });
</script>

<svelte:head>
  <title>Compare languages | Out of Papua</title>
</svelte:head>

<h2>Compare languages</h2>
{#if error}
  <Alert type="error">Error: {error}</Alert>
{/if}
<Form
  {query}
/>

{#if query.lang1 && query.lang2 && !error}
  {#if rowCount}
    <List
      {rows}
      {query}
      {rowCount}
      {pageCount}
      {multiLang}
      {multiGlosslang}
      on:refresh={handleRefresh}
    />
    <PageSizeSelect {query} preferenceKey="listPageSize" />
  {:else}
    <div class="notfound">no entries found</div>
  {/if}
{/if}
