<script context="module">
  import { normalizeQuery, parseArrayNumParams } from '$lib/util';
  import * as suggest from '$actions/suggest';

  const arrayNumParams = new Set(['glosslang']);

  export async function load({ fetch, page: { query }, session }) {
    const props = {
      langSuggest: await suggest.langPlus(fetch),
      glosslangSuggest: await suggest.glosslang(fetch),
    };
    if (!props.langSuggest || !props.glosslangSuggest) {
      return { status: 500 };
    }
    if (session.user) {
      props.borrowlangSuggest = await suggest.borrowlang(fetch);
      if (!props.borrowlangSuggest) {
        return { status: 500 };
      }
    }

    query = normalizeQuery(query);
    if ('lang1' in query && 'lang2' in query) {
      const json = await reload(fetch, query);
      if (!json) {
        return { status: 500 };
      }
      Object.assign(props, json); // populates query, pageCount, rows, rowCount (or error)
    } else {
      parseArrayNumParams(query, arrayNumParams);
      props.query = query;
    }

    return { props };
  }

  async function reload(fetch, query) {
    const res = await fetch('/api/entry/compare.json?' + new URLSearchParams(query));
    return res.ok || res.status === 400 ? res.json() : null;
  }
</script>

<script>
  import Alert from '$components/Alert.svelte';
  import Form from './_Form.svelte';
  import List from './_List.svelte';
  import PageSizeSelect from '$components/PageSizeSelect.svelte';
  import { pageLoading } from '$lib/stores';
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  export let error = null;
  export let rows = null;
  export let query;
  export let pageCount = null;
  export let rowCount = null;
  export let langSuggest;
  setContext('langSuggest', langSuggest);
  export let glosslangSuggest;
  setContext('glosslangSuggest', glosslangSuggest);
  export let borrowlangSuggest = null;
  if (borrowlangSuggest) {
    setContext('borrowlangSuggest', borrowlangSuggest);
  }

  const langNameById = Object.fromEntries(
    langSuggest.filter((v) => !v.plus).map((v) => [v.id, v.name])
  );
  setContext('langNameById', langNameById);

  const multiGlosslang = !(query.glosslang?.length === 1);
  const multiLang = !(query.lang1?.length === 1 && !query.lang1[0].match(/\+$/));

  const setSummaryCache = writable({});
  setContext('setSummaryCache', setSummaryCache);

  async function handleRefresh() {
    $setSummaryCache = {};
    $pageLoading++;
    const json = await reload(fetch, query);
    if (json) {
      ({ pageCount, query, rowCount, rows } = json);
    }
    $pageLoading--;
  }
</script>

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