<script context="module">
  import { writable } from 'svelte/store';
  import { normalizeQuery, optionalQuery, serializeQuery } from '$lib/util';

  export async function load({ fetch, page: { query }, session }) {
    const props = {
      editable: session.user !== null,
      query: normalizeQuery(query),
    };
    const json = await loadLanguages(fetch, optionalQuery(query));
    if (!json) {
      return { status: 500, error: 'Internal error' };
    }
    props.rows = writable(json.rows);
    props.query = json.query;
    return { props };
  }

  export async function loadLanguages(fetch, queryStr) {
    const res = await fetch('/api/languages.json' + queryStr);
    if (!res.ok) {
      return null;
    }
    return await res.json();
  }
</script>

<script>
  import LanguageTable from '$components/tables/LanguageTable.svelte';
  import CreateProtoLanguageForm from '$components/forms/CreateProtoLanguageForm.svelte';

  export let rows;
  export let query;
  export let editable;

  async function handleRefresh() {
    $rows = (await loadLanguages(fetch, serializeQuery(query))).rows;
  }
</script>

<main>
  <h2>Languages</h2>
  <LanguageTable 
    {rows}
    {query}
    {editable}
    on:refresh={handleRefresh}
  />

  {#if editable}
    <h3>Create proto-language</h3>
    <CreateProtoLanguageForm
      on:refresh={handleRefresh}
    />
  {/if}
</main>