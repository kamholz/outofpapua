<script context="module">
  import { normalizeQuery, parseArrayNumParams, serializeQuery } from '$lib/util';
  import { pageLoading } from '$lib/stores';
  import { writable } from 'svelte/store';
  import * as suggest from '$actions/suggest';

  const arrayNumParams = new Set(['lang']);

  export async function load({ fetch, page: { query }, session }) {
    const props = {
      editable: session.user !== null,
      langSuggest: await suggest.lang(fetch),
      glosslangSuggest: await suggest.glosslang(fetch),
    };
    if (!props.langSuggest || !props.glosslangSuggest) {
      return { status: 500, error: 'Internal error' };
    }

    query = normalizeQuery(query);
    if ('lang1' in query && 'lang2' in query) {
      const json = await reload(fetch, query);
      if (!json) {
        return { status: 500, error: 'Internal error' };
      }
      Object.assign(props, json); // populates query, pageCount, rows, rowCount
      props.rows = writable(props.rows);

      props.query.lang1 = Number(props.query.lang1);
      props.query.lang2 = Number(props.query.lang2);
      props.lang1 = { name: props.langSuggest.find((v) => v.id === props.query.lang1).name };
      props.lang2 = { name: props.langSuggest.find((v) => v.id === props.query.lang2).name };
    } else {
      parseArrayNumParams(query, arrayNumParams);
      props.query = query;
    }

    return { props };
  }

  function stripQuery(query) {
    const newQuery = { ...query };
    delete newQuery.page1;
    delete newQuery.page2;
    return newQuery;
  }

  async function reload(fetch, query) {
    const res = await fetch('/api/entry/compare.json?' + new URLSearchParams({
      ...stripQuery(query),
      page: query.page ?? 1,
    }));
    return res.ok ? res.json() : null;
  }
</script>

<script>
  import CompareForm from './_Form.svelte';
  import CompareList from './_List.svelte';
  import PageSizeSelect from '$components/PageSizeSelect.svelte';

  export let rows = null;
  export let query;
  export let editable;
  export let pageCount = null;
  export let rowCount = null;
  export let lang1 = null; // name
  export let lang2 = null; // name
  export let langSuggest;
  export let glosslangSuggest;
  $: multilang = !(query.glosslang?.length === 1);

  async function handleRefresh(newQuery) {
    $pageLoading++;
    const json = await reload(fetch, newQuery);
    if (json) {
      $rows = json.rows;
      query = json.query;
      pageCount = json.pageCount;
      rowCount = json.rowCount;
      pushState();
    }
    $pageLoading--;
  }

  function pushState() {
    history.pushState({}, '', serializeQuery(query));
  }
</script>

<h2>Compare languages</h2>
<CompareForm
  {query}
  {langSuggest}
  {glosslangSuggest}
/>

{#if query.lang1 && query.lang2}
  {#if rowCount}
    <CompareList
      {rows}
      {query}
      {rowCount}
      {pageCount}
      {lang1}
      {lang2}
      {multilang}
      on:refresh={(e) => handleRefresh(e.detail)}
    />
    <PageSizeSelect {query} preferenceKey="listPageSize" />
  {:else}
    <div class="notfound">no entries found</div>
  {/if}
{/if}

<style lang="scss">
  .notfound {
    margin-block: $item_sep;
  }
</style>