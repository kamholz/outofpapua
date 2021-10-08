<script context="module">
  import { normalizeQuery, serializeQuery } from '$lib/util';

  export async function load({ fetch, page: { query } }) {
    const props = await reload(fetch, normalizeQuery(query));
    if (!props) {
      return { status: 500 };
    }
    return { props };
  }

  export async function reload(fetch, query) {
    const res = await fetch('/api/language.json' + serializeQuery({ ...query, numentries: 1 }));
    return res.ok ? res.json() : null;
  }
</script>

<script>
  import CreateForm from './_CreateForm.svelte';
  import Table from './_Table.svelte';
  import { getContext } from 'svelte';

  export let rows;
  export let query;
  const editable = getContext('editable');

  async function handleRefresh() {
    rows = (await reload(fetch, query))?.rows;
  }
</script>

<svelte:head>
  <title>Languages | Out of Papua</title>
</svelte:head>

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
