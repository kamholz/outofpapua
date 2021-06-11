<script context="module">
  import { normalizeQuery } from '$lib/util';
  import { writable } from 'svelte/store';
  import * as suggest from '$actions/suggest';

  export async function load({ fetch, page: { query }, session }) {
    const props = {
      editable: session.user !== null,
    };
    query = normalizeQuery(query);
    const json = await reload(fetch, query, session.preferences);
    if (!json) {
      return { status: 500, error: 'Internal error' };
    }
    Object.assign(props, json); // populates query, pageCount, rows, rowCount
    props.rows = writable(props.rows);

    props.langSuggest = await suggest.langPlus(fetch);
    props.glosslangSuggest = await suggest.glosslang(fetch);
    if (!props.langSuggest || !props.glosslangSuggest) {
      return { status: 500, error: 'Internal error' };
    }

    return { props };
  }

  async function reload(fetch, query, preferences) {
    query.pagesize ??= preferences.pageSizeSet;
    const res = await fetch('/api/set.json?' + new URLSearchParams(query));
    return res.ok ? res.json() : null;
  }
</script>

<script>
  import PageSizeSelect from '$components/PageSizeSelect.svelte';
  import SearchForm from './_SearchForm.svelte';
  import SetTable from './_Table.svelte';
  // import { preferences } from '$lib/stores';

  export let rows;
  // export let editable;
  export let langSuggest;
  export let glosslangSuggest;
  export let query;
  export let pageCount;
  export let rowCount;
</script>

<h2>Search sets</h2>
<SearchForm
  {query}
  {langSuggest}
  {glosslangSuggest}
/>

{#if $rows.length}
  <div class="info">
    Total sets found: {rowCount}
  </div>
  <SetTable
    {rows}
    {query}
    {pageCount}
  />
  <div class="controls">
    <PageSizeSelect {query} preferenceKey="pageSizeSet" />
  </div>
{:else}
  <div class="notfound">no sets found</div>
{/if}

<style>
  .info {
    margin-block: 20px;
    text-indent: -1em;
    padding-inline-start: 1em;
  }

  .notfound {
    font-style: italic;
  }

  .controls {
    margin-block: 20px;
  }
</style>
