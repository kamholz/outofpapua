<script context="module">
  import { normalizeQuery, parseArrayNumParams, parseArrayParams } from '$lib/util';
  import { writable } from 'svelte/store';
  import * as suggest from '$actions/suggest';

  const arrayParams = new Set(['lang']);
  const arrayNumParams = new Set(['glosslang']);

  export async function load({ page: { query }, fetch }) {
    const props = {};
    query = normalizeQuery(query);
    if (['headword', 'gloss'].some((attr) => attr in query)) {
      const res = await fetch('/api/search.json?' + new URLSearchParams(query));
      if (!res.ok) {
        return { status: 500, error: 'Internal error' };
      }
      Object.assign(props, await res.json()); // populates props.query, props.pageCount
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
  import { fade } from 'svelte/transition';

  export let rows = null;
  export let langSuggest;
  export let glosslangSuggest;
  export let query;
  export let pageCount = null;
</script>

<div in:fade={{ duration: 200 }}>
<h2>Search entries</h2>
<SearchForm
  {query}
  {langSuggest}
  {glosslangSuggest}
/>

{#if $rows}
  <h3>Search results</h3>
  {#if $rows.length}
    <SearchTable
      {rows}
      {query}
      {pageCount}
    />
  {:else}
    <div class="notfound">nothing found</div>
  {/if}
{/if}
</div>

<style>
  .notfound {
    font-style: italic;
  }
</style>
