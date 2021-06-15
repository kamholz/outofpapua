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
      Object.assign(props, json); // populates lang1, lang2
      props.lang1.rows = writable(props.lang1.rows);
      props.lang2.rows = writable(props.lang2.rows);
    }

    props.query = query;
    props.langSuggest = await suggest.lang(fetch);
    props.glosslangSuggest = await suggest.glosslang(fetch);
    if (!props.langSuggest || !props.glosslangSuggest) {
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
    return {
      lang1: await res1.json(),
      lang2: await res2.json(),
    };
  }
</script>

<script>
  import CompareForm from './_Form.svelte';
  import CompareList from './_List.svelte';
  import PageSizeSelect from '$components/PageSizeSelect.svelte';

  export let lang1 = null;
  export let lang2 = null;
  export let query;
  export let editable;
  export let langSuggest;
  export let glosslangSuggest;
  if (lang1) {
    query.lang1 = Number(query.lang1);
    lang1.name = langSuggest.find((v) => v.id === query.lang1).name;
  }
  if (lang2) {
    query.lang2 = Number(query.lang2);
    lang2.name = langSuggest.find((v) => v.id === query.lang2).name;
  }

  const multilang = !(query.glosslang?.length === 1);
</script>

<h2>Compare languages</h2>
<CompareForm
  {query}
  {langSuggest}
  {glosslangSuggest}
/>

{#if lang1 && lang2}
  {#if lang1?.rowCount || lang2?.rowCount}
    <div class="results">
      <div>
        <CompareList {...lang1} {query} {lang2} {multilang} />
      </div>
      <div>
        <CompareList {...lang2} {query} lang2={lang1} {multilang} />
      </div>
    </div>
    <div class="controls">
      <PageSizeSelect {query} />
    </div>
  {:else}
    <div class="notfound">no entries found</div>
  {/if}
{/if}

<style lang="scss">
  .controls, .notfound {
    margin-block: $item_sep;
  }

  .results {
    display: grid;
    grid-template-columns: 50% 50%;
    column-gap: 10px;
  }
</style>