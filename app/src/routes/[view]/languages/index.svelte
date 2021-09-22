<script context="module">
  import { normalizeQuery, serializeQuery } from '$lib/util';

  export async function load({ fetch, page: { params, query } }) {
    const props = { view: params.view };
    const json = await reload(fetch, params.view, normalizeQuery(query));
    if (!json) {
      return { status: 500 };
    }
    Object.assign(props, json);
    return { props };
  }

  export async function reload(fetch, view, query) {
    const res = await fetch('/api/language.json' + serializeQuery({ ...query, numentries: true, view }));
    return res.ok ? res.json() : null;
  }
</script>

<script>
  import CreateForm from './_CreateForm.svelte';
  import Table from './_Table.svelte';
  import { getContext, setContext } from 'svelte';

  export let view;
  setContext('view', view);
  export let rows;
  export let query;
  const editable = getContext('editable');

  async function handleRefresh() {
    rows = (await reload(fetch, query))?.rows;
  }
</script>

<h2>Languages</h2>
<Table
  {rows}
  {query}
  on:refresh={handleRefresh}
/>

{#if editable}
  <h3>Create proto-language</h3>
  <CreateForm
    on:refresh={handleRefresh}
  />
{/if}
