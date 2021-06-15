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
      Object.assign(props, json); // populates query, pageCount, rows, rowCount
      props.rows = writable(props.rows);
    } else {
      props.query = query;
    }

    props.langSuggest = await suggest.lang(fetch);
    if (!props.langSuggest) {
      return { status: 500, error: 'Internal error' };
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
  import { glossesSummary } from '$lib/util';
  import { preferences } from '$lib/stores';

  export let rows = null;
  export let query;
  export let editable;
  export let pageCount = null;
  export let rowCount = null;
  export let langSuggest;

  function mungePos(pos) {
    return pos.replace(/\.$/, '');
  }
</script>

<h2>Compare languages</h2>
<CompareForm
  {query}
  {langSuggest}
/>

<div>
  Total found: {rowCount}
</div>

{#if $rows.length}
  <hr>
  {#each $rows as row (row.id)}
    <div>
      <strong>{row.headword}</strong>
      {#each row.senses as { pos, glosses }, i}
        {#if glosses.length}
          <p>
            {i + 1}. {#if pos}<em>{mungePos(pos)}</em>. {/if}{glossesSummary(glosses, $preferences)}
          </p>
        {/if}
      {/each}
    </div>
    {#if row.entries2}
      <div>
        <br>
        Language 2 comparisons:
      </div>
      {#each row.entries2 as { headword, senses } }
        <div>
          <br>
          <strong>{headword}</strong>
          {#each senses as { pos, glosses }, i}
            {#if glosses.length}
              <p>
                {i + 1}. {#if pos}<em>{mungePos(pos)}</em>. {/if}{glossesSummary(glosses, $preferences)}
              </p>
            {/if}
          {/each}
        </div>
      {/each}
    {/if}
    <hr>
  {/each}
{/if}

<style lang="scss">
  @include hr;
</style>