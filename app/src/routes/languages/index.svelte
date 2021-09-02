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
  import CreateLanguageForm from './_CreateForm.svelte';
  import LanguagesTable from './_Table.svelte';
  import { getContext } from 'svelte';

  export let rows;
  export let query;
  const editable = getContext('editable');

  async function handleRefresh() {
    rows = (await reload(fetch, query))?.rows;
  }
</script>

<h2>Languages</h2>
<LanguagesTable
  {rows}
  {query}
  on:refresh={handleRefresh}
/>

{#if editable}
  <h3>Create proto-language</h3>
  <CreateLanguageForm
    on:refresh={handleRefresh}
  />
{/if}
