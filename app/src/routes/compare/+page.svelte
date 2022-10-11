<script>
  import Alert from '$components/Alert.svelte';
  import Form from './Form.svelte';
  import List from './List.svelte';
  import PageSizeSelect from '$components/PageSizeSelect.svelte';
  import { page } from '$app/stores';
  import { pageLoading, setSummaryCache } from '$lib/stores';
  import { reload } from './+page';
  import { setContext } from 'svelte';

  export let data;
  $: ({
    pageCount,
    query,
    rowCount,
    rows,
    error,
  } = data);
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

  $: multiGlosslang = !(query.glosslang?.length === 1);
  $: multiLang = !(query.lang1?.length === 1 && !query.lang1[0].match(/\+$/));

  setContext('setSummaryCache', setSummaryCache);

  $: init($page);

  function init() {
    $setSummaryCache = {};
  }

  async function handleRefresh() {
    $pageLoading++;
    const json = await reload(fetch, query);
    if (json) {
      ({ pageCount, query, rowCount, rows } = json);
    }
    $pageLoading--;
    init();
  }
</script>

<svelte:head>
  <title>Compare languages | Out of Papua</title>
</svelte:head>

<h2>Compare languages</h2>
{#if error}
  <Alert type="error" message="Error: {error}" />
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