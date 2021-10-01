<script context="module">
  import { normalizeQuery, parseArrayNumParams, parseArrayParams, serializeQuery } from '$lib/util';
  import * as suggest from '$actions/suggest';

  const arrayParams = new Set(['lang']);
  const arrayNumParams = new Set(['glosslang']);

  export async function load({ fetch, page: { query } }) {
    const props = {
      langSuggest: await suggest.langPlus(fetch),
      glosslangSuggest: await suggest.glosslang(fetch),
      borrowlangSuggest: await suggest.borrowlang(fetch),
    };
    if (!props.langSuggest || !props.glosslangSuggest || !props.borrowlangSuggest) {
      return { status: 500 };
    }

    query = normalizeQuery(query);
    if (['borrowlang', 'gloss', 'headword', 'headword_ipa', 'record'].some((attr) => attr in query)) {
      const json = await reload(fetch, query);
      if (!json) {
        return { status: 500 };
      }
      Object.assign(props, json); // populates query, pageCount, rows, rowCount
    } else {
      parseArrayParams(query, arrayParams);
      parseArrayNumParams(query, arrayNumParams);
      if (!('langcat' in query)) {
        query.langcat = 'lang';
      }
      if (!('set' in query)) {
        query.set = 'both';
      }
      if (!('origin' in query)) {
        query.origin = 'all';
      }
      props.query = query;
    }

    return { props };
  }

  async function reload(fetch, query) {
    const res = await fetch('/api/entry.json' + serializeQuery(query));
    return res.ok ? res.json() : null;
  }
</script>

<script>
  import Alert from '$components/Alert.svelte';
  import PageSizeSelect from '$components/PageSizeSelect.svelte';
  import SearchForm from './_SearchForm.svelte';
  import SearchTable from './_SearchTable.svelte';
  import SearchTableControls from './_SearchTableControls.svelte';
  import { getContext, setContext } from 'svelte';
  import { goto } from '$app/navigation';
  import { pageLoading } from '$lib/stores';
  import { serializeArrayParam } from '$lib/util';
  import { writable } from 'svelte/store';
  import * as crudSet from '$actions/crud/set';

  export let rows = null;
  export let query;
  export let pageCount = null;
  export let rowCount = null;
  export let langSuggest;
  setContext('langSuggest', langSuggest);
  export let glosslangSuggest;
  setContext('glosslangSuggest', glosslangSuggest);
  export let borrowlangSuggest;
  setContext('borrowlangSuggest', borrowlangSuggest);

  const linkable = getContext('editable') && query.set !== 'linked';
  const selection = writable(new Set());
  setContext('selection', selection);
  const setSummaryCache = writable({});
  setContext('setSummaryCache', setSummaryCache);
  let promise;

  async function handleLink() {
    $pageLoading++;
    try {
      promise = crudSet.linkEntries(getSelection(), handleRefresh);
      await promise;
    } catch (e) {}
    $pageLoading--;
  }

  function handleMap() {
    goto('/map?' + new URLSearchParams({ entries: serializeArrayParam([...$selection]) }));
  }

  async function handleRefresh() {
    $pageLoading++;
    rows = (await reload(fetch, query))?.rows;
    $pageLoading--;
    $setSummaryCache = {};
    clearSelection();
  }

  function getSelection() {
    return rows.filter((row) => $selection.has(row.id));
  }

  function clearSelection() {
    $selection = new Set();
  }
</script>

<h2>Search entries</h2>
<SearchForm
  {query}
/>

{#if rows}
  <div class="container">
    <div class="controls">
      <div>
        Total found: {rowCount}
      </div>
      {#if rows.length}
        <SearchTableControls {linkable} on:clear={clearSelection} on:link={handleLink} on:map={handleMap} />
      {/if}
    </div>
    {#if rows.length}
      {#if promise}
        {#await promise catch { message }}
          <Alert type="error" {message} />
        {/await}
      {/if}
      <SearchTable
        {rows}
        {query}
        {pageCount}
        on:link={handleRefresh}
      />
      <div class="controls">
        <PageSizeSelect {query} preferenceKey="tablePageSize" />
        {#if rows.length}
          <SearchTableControls {linkable} on:clear={clearSelection} on:link={handleLink} on:map={handleMap} />
        {/if}
      </div>
    {:else}
      <div class="notfound">nothing found</div>
    {/if}
  </div>
{/if}

<style lang="scss">
  .container {
    display: inline-block;
  }

  .controls {
    margin-block: var(--item-sep);
    display: flex;
    justify-content: space-between;
  }
</style>
