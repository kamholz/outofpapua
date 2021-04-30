<script context="module">
  import { normalizeQuery, serializeQuery } from '$lib/util';
  import { writable } from 'svelte/store';
  import * as suggest from '$actions/suggest';

  export async function load({ fetch, page: { query }, session }) {
    const props = {
      editable: session.user !== null,
    };
    const json = await reload(fetch, normalizeQuery(query));
    if (!json) {
      return { status: 500, error: 'Internal error' };
    }
    Object.assign(props, json);
    props.rows = writable(props.rows);
    if (props.editable) {
      props.protolangSuggest = await suggest.protolang(fetch);
    }
    return { props };
  }

  export async function reload(fetch, query) {
    const res = await fetch('/api/source.json' + serializeQuery({ ...query, numentries: 1 }));
    return res.ok ? res.json() : null;
  }
</script>

<script>
  import CreateSourceForm from './_CreateForm.svelte';
  import SourcesTable from './_Table.svelte';
  import { fade } from 'svelte/transition';

  export let rows;
  export let query;
  export let editable;
  export let protolangSuggest = null;

  async function handleRefresh() {
    $rows = (await reload(fetch, query)).rows;
  }
</script>

<div in:fade={{ duration: 200 }}>
<h2>Sources</h2>
<SourcesTable
  {rows}
  {query}
  on:refresh={handleRefresh}
/>
</div>

{#if editable}
  <h3>Create new proto-language source</h3>
  <CreateSourceForm
    {protolangSuggest}
    on:refresh={handleRefresh}
  />
{/if}
