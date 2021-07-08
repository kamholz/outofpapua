<script context="module">
  import { normalizeQuery, parseArrayNumParams, parseArrayParams } from '$lib/util';
  import { writable } from 'svelte/store';
  import * as suggest from '$actions/suggest';

  const arrayParams = new Set(['lang']);
  const arrayNumParams = new Set(['glosslang']);

  export async function load({ fetch, page: { query }, session }) {
    const props = {
      editable: session.user !== null,
      langSuggest: await suggest.langPlus(fetch),
      glosslangSuggest: await suggest.glosslang(fetch),
    };
    if (!props.langSuggest || !props.glosslangSuggest) {
      return { status: 500, error: 'Internal error' };
    }
    if (props.editable) {
      props.borrowlangSuggest = await suggest.borrowlang(fetch);
      if (!props.borrowlangSuggest) {
        return { status: 500, error: 'Internal error' };
      }
    }

    query = normalizeQuery(query);
    if (['headword', 'gloss'].some((attr) => attr in query)) {
      const json = await reload(fetch, query);
      if (!json) {
        return { status: 500, error: 'Internal error' };
      }
      Object.assign(props, json); // populates query, pageCount, rows, rowCount
      props.rows = writable(props.rows);
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
    const res = await fetch('/api/entry.json?' + new URLSearchParams(query));
    return res.ok ? res.json() : null;
  }
</script>

<script>
  import PageSizeSelect from '$components/PageSizeSelect.svelte';
  import SearchForm from './_SearchForm.svelte';
  import SearchTable from './_SearchTable.svelte';
  import SearchTableControls from './_SearchTableControls.svelte';
  import { pageLoading } from '$lib/stores';
  import { setContext } from 'svelte';
  import * as crud from '$actions/crud';

  export let rows = null;
  export let query;
  export let editable;
  export let pageCount = null;
  export let rowCount = null;
  export let langSuggest;
  export let glosslangSuggest;
  export let borrowlangSuggest = null;

  const linkable = editable && query.set !== 'linked';
  let selection;
  if (linkable) {
    selection = writable({});
    setContext('selection', selection);
  }

  const setSummaryCache = writable({});
  setContext('setSummaryCache', setSummaryCache);

  function handleClear() {
    $selection = {};
  }

  async function handleLink() {
    $pageLoading++;
    await crud.linkEntries(Object.values($selection), handleRefresh);
    $pageLoading--;
  }

  async function handleRefresh() {
    $rows = (await reload(fetch, query)).rows;
    $setSummaryCache = {};
    $selection = {};
  }
</script>

<h2>Search entries</h2>
<SearchForm
  {query}
  {langSuggest}
  {glosslangSuggest}
/>

{#if $rows}
  <div class="container">
    <div class="controls">
      <div>
        Total found: {rowCount}
      </div>
      {#if editable && query.set !== 'linked' && $rows.length}
        <SearchTableControls on:clear={handleClear} on:link={handleLink} />
      {/if}
    </div>
    {#if $rows.length}
      <SearchTable
        {rows}
        {query}
        {pageCount}
        {editable}
        {linkable}
        {borrowlangSuggest}
      />
      <div class="controls">
        <PageSizeSelect {query} preferenceKey="tablePageSize" />
        {#if editable && query.set !== 'linked' && $rows.length}
          <SearchTableControls on:clear={handleClear} on:link={handleLink} />
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
    margin-block: $item_sep;
    display: flex;
    justify-content: space-between;
  }
</style>
