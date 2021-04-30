<script context="module">
  import { normalizeQuery, serializeQuery } from '$lib/util';
  import { writable } from 'svelte/store';

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
  import { fade } from 'svelte/transition';

  export let rows;
  export let query;
  export let editable;

  async function handleRefresh() {
    $rows = (await reload(fetch, query)).rows;
  }
</script>

<div in:fade={{ duration: 200 }}>
<h2>Languages</h2>
<LanguagesTable
  {rows}
  {query}
  {editable}
  on:refresh={handleRefresh}
/>

{#if editable}
  <h3>Create proto-language</h3>
  <CreateLanguageForm
    on:create={handleRefresh}
  />
{/if}
</div>
