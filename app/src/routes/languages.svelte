<script context="module">
  export async function load({ fetch, session }) {
    const props = {
      editable: session.user !== null
    };
    const rows = await loadLanguages(fetch, props.editable);
    if (!rows) {
      return { status: 500, error: 'Internal error' };
    }
    props.rows = rows;
    return { props };
  }

  export async function loadLanguages(fetch, editable) {
    const res = await fetch('/api/languages.json');
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
  export let editable;

  async function handleRefresh() {
    rows = await loadLanguages(fetch, editable);
  }
</script>

<main>
  <h2>Languages</h2>
  <LanguageTable 
    {rows}
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