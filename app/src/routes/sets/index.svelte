<script context="module">
  import { normalizeQuery } from '$lib/util';
  import * as suggest from '$actions/suggest';

  export async function load({ fetch, session, url: { searchParams } }) {
    const props = {
      setAuthorSuggest: await suggest.setAuthor(fetch),
      sourceSuggest: await suggest.source(fetch),
      langSuggest: await suggest.langPlus(fetch),
      glosslangSuggest: await suggest.glosslang(fetch),
    };
    if (!props.sourceSuggest || !props.langSuggest || !props.glosslangSuggest) {
      return { status: 500 };
    }
    if (session.user) {
      props.borrowlangSuggest = await suggest.borrowlang(fetch);
      if (!props.borrowlangSuggest) {
        return { status: 500 };
      }
    }

    const query = normalizeQuery(searchParams);
    query.pagesize ??= session.preferences.listPageSize;
    const json = await reload(fetch, query, session.preferences);
    if (!json) {
      return { status: 500 };
    }
    Object.assign(props, json); // populates query, pageCount, rows, rowCount

    return { props };
  }

  async function reload(fetch, query) {
    const res = await fetch('/api/set.json?' + new URLSearchParams(query));
    return res.ok ? res.json() : null;
  }
</script>

<script>
  import List from './_List.svelte';
  import PageSizeSelect from '$components/PageSizeSelect.svelte';
  import SearchForm from './_SearchForm.svelte';
  import { setContext } from 'svelte';

  export let rows;
  export let setAuthorSuggest;
  setContext('setAuthorSuggest', setAuthorSuggest);
  export let sourceSuggest;
  setContext('sourceSuggest', sourceSuggest);
  export let langSuggest;
  setContext('langSuggest', langSuggest);
  export let glosslangSuggest;
  setContext('glosslangSuggest', glosslangSuggest);
  export let borrowlangSuggest = null;
  if (borrowlangSuggest) {
    setContext('borrowlangSuggest', borrowlangSuggest);
  }
  export let query;
  export let pageCount;
  export let rowCount;

  async function handleRefresh() {
    const json = await reload(fetch, query);
    if (json) {
      ({ rows } = json);
      ({ pageCount } = json);
      ({ rowCount } = json);
    }
  }
</script>

<svelte:head>
  <title>Search sets | Out of Papua</title>
</svelte:head>

<h2>Search sets</h2>
<SearchForm
  {query}
/>

{#if rows.length}
  <div class="info">
    Total sets found: {rowCount}
  </div>
  <List
    {rows}
    {query}
    {pageCount}
    on:refresh={handleRefresh}
  />
  <div class="controls">
    <PageSizeSelect {query} preferenceKey="listPageSize" />
  </div>
{:else}
  <div class="notfound">no sets found</div>
{/if}

<style lang="scss">
  .info {
    margin-block: var(--item-sep);
    @include indent;
  }

  .controls {
    margin-block: var(--item-sep);
  }
</style>
