<script context="module">
  import { normalizeQuery, serializeQuery } from '$lib/util';
  import * as suggest from '$actions/suggest';

  export async function load({ fetch, page: { query }, session }) {
    const props = {
      editable: session.user !== null,
    };
    if (props.editable) {
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
  import CreateSourceForm from './_CreateForm.svelte';
  import SourcesTable from './_Table.svelte';
  import { setContext } from 'svelte';

  export let rows;
  export let query;
  export let editable;
  export let protolangSuggest = null;
  if (protolangSuggest) {
    setContext('protolangSuggest', protolangSuggest);
  }

  async function handleRefresh() {
    rows = (await reload(fetch, query))?.rows;
  }
</script>

<h2>Sources</h2>
<SourcesTable
  {rows}
  {query}
  on:refresh={handleRefresh}
/>

{#if editable}
  <h3>Create new proto-language source</h3>
  <CreateSourceForm
    on:refresh={handleRefresh}
  />
{/if}
