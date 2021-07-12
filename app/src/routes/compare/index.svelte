<script context="module">
  import { normalizeQuery, parseArrayNumParams } from '$lib/util';
  import * as suggest from '$actions/suggest';

  const arrayNumParams = new Set(['glosslang']);

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

      props.query.lang1 = Number(props.query.lang1);
      props.query.lang2 = Number(props.query.lang2);
      props.lang1Name = props.langSuggest.find((v) => v.id === props.query.lang1).name;
      props.lang2Name = props.langSuggest.find((v) => v.id === props.query.lang2).name;
    } else {
      parseArrayNumParams(query, arrayNumParams);
      props.query = query;
    }

    return { props };
  }

  async function reload(fetch, query) {
    const res = await fetch('/api/entry/compare.json?' + new URLSearchParams(query));
    return res.ok ? res.json() : null;
  }
</script>

<script>
  import CompareForm from './_Form.svelte';
  import CompareList from './_List.svelte';
  import PageSizeSelect from '$components/PageSizeSelect.svelte';
  import { pageLoading } from '$lib/stores';
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  export let rows = null;
  export let query;
  export let editable;
  setContext('editable', editable);
  export let pageCount = null;
  export let rowCount = null;
  export let lang1Name = null;
  export let lang2Name = null;
  export let langSuggest;
  setContext('langSuggest', langSuggest);
  export let glosslangSuggest;
  setContext('glosslangSuggest', glosslangSuggest);
  $: multilang = !(query.glosslang?.length === 1);

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
<CompareForm
  {query}
/>

{#if query.lang1 && query.lang2}
  {#if rowCount}
    <CompareList
      {rows}
      {query}
      {rowCount}
      {pageCount}
      {lang1Name}
      {lang2Name}
      {multilang}
      on:refresh={handleRefresh}
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