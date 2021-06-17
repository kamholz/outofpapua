<script context="module">
  import { normalizeQuery } from '$lib/util';
  import { writable } from 'svelte/store';
  import * as suggest from '$actions/suggest';

  export async function load({ fetch, page: { query }, session }) {
    const props = {
      editable: session.user !== null,
      sourceSuggest: await suggest.source(fetch),
      langSuggest: await suggest.langPlus(fetch),
      glosslangSuggest: await suggest.glosslang(fetch),
    };
    if (!props.sourceSuggest || !props.langSuggest || !props.glosslangSuggest) {
      return { status: 500, error: 'Internal error' };
    }
    if (props.editable) {
      props.borrowlangSuggest = await suggest.borrowlang(fetch);
      if (!props.borrowlangSuggest) {
        return { status: 500, error: 'Internal error' };
      }
    }

    query = normalizeQuery(query);
    const json = await reload(fetch, query, session.preferences);
    if (!json) {
      return { status: 500, error: 'Internal error' };
    }
    Object.assign(props, json); // populates query, pageCount, rows, rowCount
    props.rows = writable(props.rows);

    return { props };
  }

  async function reload(fetch, query, preferences) {
    query.pagesize ??= preferences.listPageSize;
    const res = await fetch('/api/set.json?' + new URLSearchParams(query));
    return res.ok ? res.json() : null;
  }
</script>

<script>
  import PageSizeSelect from '$components/PageSizeSelect.svelte';
  import SearchForm from './_SearchForm.svelte';
  import SetList from './_List.svelte';

  export let rows;
  export let editable;
  export let sourceSuggest;
  export let langSuggest;
  export let glosslangSuggest;
  export let borrowlangSuggest = null;
  export let query;
  export let pageCount;
  export let rowCount;
</script>

<h2>Search sets</h2>
<SearchForm
  {query}
  {sourceSuggest}
  {langSuggest}
  {glosslangSuggest}
/>

{#if $rows.length}
  <div class="info">
    Total sets found: {rowCount}
  </div>
  <SetList
    {rows}
    {query}
    {pageCount}
    {editable}
    {borrowlangSuggest}
  />
  <div class="controls">
    <PageSizeSelect {query} preferenceKey="listPageSize" />
  </div>
{:else}
  <div class="notfound">no sets found</div>
{/if}

<style lang="scss">
  .info {
    margin-block: $item_sep;
    @include indent;
  }

  .controls {
    margin-block: $item_sep;
  }
</style>
