<script context="module">
  import { normalizeQuery, parseArrayNumParams, parseArrayParams } from '$lib/util';
  import { writable } from 'svelte/store';
  import * as suggest from '$actions/suggest';

  const arrayParams = new Set(['lang']);
  const arrayNumParams = new Set(['glosslang']);

  export async function load({ fetch, page: { query }, session }) {
    const props = {
      editable: session.user !== null,
    };
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
      props.query = query;
    }

    props.langSuggest = await suggest.langPlus(fetch);
    props.glosslangSuggest = await suggest.glosslang(fetch);
    if (!props.langSuggest || !props.glosslangSuggest) {
      return { status: 500, error: 'Internal error' };
    }

    return { props };
  }

  async function reload(fetch, query) {
    const res = await fetch('/api/entry/search.json?' + new URLSearchParams(query));
    return res.ok ? res.json() : null;
  }
</script>

<script>
  import PageSizeSelect from '$components/PageSizeSelect.svelte';
  import SearchForm from './_SearchForm.svelte';
  import SearchTable from './_SearchTable.svelte';
  import SearchTableControls from './_SearchTableControls.svelte';
  import { pageLoading } from '$stores';
  import { setContext } from 'svelte';
  import * as crudSet from '$actions/crud/set';

  export let rows = null;
  export let editable;
  export let langSuggest;
  export let glosslangSuggest;
  export let query;
  export let pageCount = null;
  export let rowCount = null;

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
    const current = Object.values($selection);
    if (!current.length) {
      return;
    }
    $pageLoading++;
    try {
      const members = current.map((v) => v.entry_id);
      const existingSet = current.find((v) => v.set_id !== null);
      if (existingSet) {
        const id = existingSet.set_id;
        await crudSet.update({ id, values: { members } });
      } else {
        await crudSet.create({ members });
      }
      handleRefresh();
    } catch (e) {
      console.log(e);
    }
    $pageLoading--;
  }

  async function handleRefresh() {
    $rows = (await reload(fetch, query)).rows;
    $setSummaryCache = {};
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
      {#if editable && query.set !== 'linked'}
        <SearchTableControls on:clear={handleClear} on:link={handleLink} />
      {/if}
    </div>
    {#if $rows.length}
      <SearchTable
        {rows}
        {query}
        {pageCount}
        {linkable}
      />
      <div class="controls">
        <PageSizeSelect {query} />
        {#if editable && query.set !== 'linked'}
          <SearchTableControls on:clear={handleClear} on:link={handleLink} />
        {/if}
      </div>
    {:else}
      <div class="notfound">nothing found</div>
    {/if}
  </div>
{/if}

<style>
  .container {
    display: inline-block;
  }
  .controls {
    margin-block: 20px;
    display: flex;
    justify-content: space-between;
  }

  .notfound {
    font-style: italic;
  }
</style>
