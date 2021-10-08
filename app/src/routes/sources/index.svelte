<script context="module">
  import { normalizeQuery, serializeQuery } from '$lib/util';
  import * as suggest from '$actions/suggest';

  export async function load({ fetch, page: { query }, session }) {
    const props = {};
    if (session.user) {
      props.protolangSuggest = await suggest.protolang(fetch);
      if (!props.protolangSuggest) {
        return { status: 500 };
      }
    }

    const json = await reload(fetch, normalizeQuery(query));
    if (!json) {
      return { status: 500 };
    }
    Object.assign(props, json);

    return { props };
  }

  export async function reload(fetch, query) {
    const res = await fetch('/api/source.json' + serializeQuery({ ...query, numentries: 1 }));
    return res.ok ? res.json() : null;
  }
</script>

<script>
  import CreateForm from './_CreateForm.svelte';
  import Table from './_Table.svelte';
  import { getContext, setContext } from 'svelte';

  export let rows;
  export let query;
  export let protolangSuggest = null;
  if (protolangSuggest) {
    setContext('protolangSuggest', protolangSuggest);
  }
  const editable = getContext('editable');

  async function handleRefresh() {
    rows = (await reload(fetch, query))?.rows;
  }
</script>

<svelte:head>
  <title>Sources | Out of Papua</title>
</svelte:head>

<h2>Sources</h2>
<Table
  {rows}
  {query}
/>

{#if editable}
  <h3>Create new proto-language source</h3>
  <CreateForm
    on:refresh={handleRefresh}
  />
{/if}
