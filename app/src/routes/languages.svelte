<script context="module">
  export async function load({ fetch, session }) {
    const props = {
      editable: session.user !== null
    };
    const loaded = await loadLanguages(fetch, props.editable);
    if (!loaded) {
      return { status: 500, error: 'Internal error' };
    }
    Object.assign(props, loaded);
    return { props };
  }

  export async function loadLanguages(fetch, editable) {
    const res = await fetch('/api/languages.json');
    if (!res.ok) {
      return null;
    }
    const rows = await res.json();
    const parentSuggest = editable ? rows.filter(v => v.is_proto) : null;
    return { rows, parentSuggest };
  }
</script>

<script>
  import LanguageTable from '$components/tables/LanguageTable.svelte';
  import CreateProtoLanguageForm from '$components/forms/CreateProtoLanguageForm.svelte';

  export let rows;
  export let editable;
  export let parentSuggest;

  async function handleRefresh() {
    ({ rows, parentSuggest } = await loadLanguages(fetch, editable));
  }
</script>

<main>
  <h2>Languages</h2>
  <LanguageTable 
    {rows}
    {editable}
    {parentSuggest}
  />

  {#if editable}
    <h3>Create proto-language</h3>
    <CreateProtoLanguageForm
      on:refresh={handleRefresh}
    />
  {/if}
</main>