<script context="module">
  import { normalizeQuery, parseArrayNumParams } from '$lib/util';
  import { writable } from 'svelte/store';
  import * as suggest from '$actions/suggest';

  const arrayNumParams = new Set(['lang']);

  export async function load({ fetch, page: { query }, session }) {
    const props = {
      editable: session.user !== null,
    };
    query = normalizeQuery(query);
    parseArrayNumParams(query, arrayNumParams);
    if ('lang1' in query && 'lang2' in query) {
      const json = await reload(fetch, query);
      if (!json) {
        return { status: 500, error: 'Internal error' };
      }
      Object.assign(props, json); // populates pageCount, rowCount, rows1, rows2
      props.rows1 = writable(props.rows1);
      props.rows2 = writable(props.rows2);
    }

    props.query = query;
    props.langSuggest = await suggest.lang(fetch);
    if (!props.langSuggest) {
      return { status: 500, error: 'Internal error' };
    }

    return { props };
  }

  async function reload(fetch, query) {
    const res1 = await fetch('/api/entry/compare.json?' + new URLSearchParams(query));
    if (!res1.ok) {
      return null;
    }
    const res2 = await fetch('/api/entry/compare.json?' + new URLSearchParams({
      ...query,
      lang2: query.lang1,
      lang1: query.lang2,
    }));
    if (!res2.ok) {
      return null;
    }
    const props1 = await res1.json();
    const props2 = await res2.json();
    return {
      pageCount: Math.max(props1.pageCount, props2.pageCount),
      rowCount: Math.max(props1.rowCount, props2.rowCount),
      rows1: props1.rows,
      rows2: props2.rows,
    };
  }
</script>

<script>
  import CompareForm from './_Form.svelte';
  import CompareList from './_List.svelte';
  import PageSizeSelect from '$components/PageSizeSelect.svelte';

  export let rows1 = null;
  export let rows2 = null;
  export let query;
  export let editable;
  export let pageCount = null;
  export let rowCount = null;
  export let langSuggest;

  const langName1 = query.lang1 && langSuggest.find((v) => v.id == query.lang1)?.name;
  const langName2 = query.lang2 && langSuggest.find((v) => v.id == query.lang2)?.name;
</script>

<h2>Compare languages</h2>
<CompareForm
  {query}
  {langSuggest}
/>

{#if rowCount}
  <div class="info">
    Total entries: {rowCount}
  </div>
  <div class="results">
    <div>
      <CompareList rows={rows1} {langName1} {langName2} />
    </div>
    <div>
      <CompareList rows={rows2} langName1={langName2} langName2={langName1} />
    </div>
  </div>
  <div class="controls">
    <PageSizeSelect {query} />
  </div>
{:else}
  <div class="notfound">no entries found</div>
{/if}

<style lang="scss">
  .info, .controls, .notfound {
    margin-block: $item_sep;
  }

  .results {
    display: grid;
    grid-template-columns: 50% 50%;
    column-gap: 10px;
  }
</style>