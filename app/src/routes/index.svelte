<script context="module">
  import PageSizeSelect from '$components/PageSizeSelect.svelte';
  import { normalizeQuery, parseArrayNumParams, parseArrayParams } from '$lib/util';
  import { writable } from 'svelte/store';
  import * as suggest from '$actions/suggest';

  const arrayParams = new Set(['lang']);
  const arrayNumParams = new Set(['glosslang']);

  export async function load({ page: { query }, fetch }) {
    const props = {};
    query = normalizeQuery(query);
    if (['headword', 'gloss'].some((attr) => attr in query)) {
      const res = await fetch('/api/entry/glosses.json?' + new URLSearchParams(query));
      if (!res.ok) {
        return { status: 500, error: 'Internal error' };
      }
      Object.assign(props, await res.json()); // populates query, pageCount, rows, rowCount
      props.rows = writable(props.rows);
    } else {
      parseArrayParams(query, arrayParams);
      parseArrayNumParams(query, arrayNumParams);
      if (!('category' in query)) {
        query.category = 'lang';
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
</script>

<script>
  import SearchForm from './_SearchForm.svelte';
  import SearchTable from './_SearchTable.svelte';
  import SearchTableControls from './_SearchTableControls.svelte';
  import { fade } from 'svelte/transition';
  import { setContext } from 'svelte';

  export let rows = null;
  export let langSuggest;
  export let glosslangSuggest;
  export let query;
  export let pageCount = null;
  export let rowCount = null;

  const selection = writable({});
  setContext('selection', selection);
  setContext('setSummaryCache', writable({}));

  function handleClear() {
    $selection = {};
  }

  function handleLink() {

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
      <SearchTableControls on:clear={handleClear} on:link={handleLink} />
    </div>
    {#if $rows.length}
      <SearchTable
        {rows}
        {query}
        {pageCount}
      />
      <div class="controls">
        <PageSizeSelect {query} />
        <SearchTableControls on:clear={handleClear} on:link={handleLink} />
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
