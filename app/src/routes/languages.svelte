<script context="module">
  export async function load({ fetch, session }) {
    const props = {
      editable: session.user !== null
    };
    const loaded = await loadLanguages(fetch, props.editable);
    if (!loaded) {
      return { status: 500, error: 'Internal error' };
    }
    props.rows = loaded.rows;
    props.parentSuggest = loaded.parentSuggest;
    return { props };
  }

  export async function loadLanguages(fetch, editable) {
    const res = await fetch('/api/languages.json');
    if (!res.ok) {
      return null;
    }
    const rows = await res.json();
    //const parentSuggest = editable ? rows.filter(v => v.is_proto) : null;
    const parentSuggest = editable ? rows.filter(v => 1) : null;
    return { rows, parentSuggest };
  }
</script>

<script>
  import { session } from '$app/stores';
  import * as crud from '$actions/crud';
  import { boolean } from '$lib/util';
  import Table from '$components/Table.svelte';
  import Alert from '$components/Alert.svelte';
  import Form from '$components/Form.svelte';

  export let rows;
  export let editable;
  export let parentSuggest;
  let error = null;

  const columns = [
    {
      key: 'name',
      title: 'Language',
      editable: true,
      type: 'text',
    },
    {
      key: 'iso6393',
      title: 'ISO 639-3 Code',
    },
    {
      key: 'is_proto',
      title: 'Proto-language',
      value: row => boolean(row.is_proto),
    },
    {
      key: 'parent_name',
      title: 'Parent',
      editable: true,
      type: 'autocomplete',
      autocomplete: {
        data: parentSuggest,
        extract: item => item.name,
      },
      autocompleteValue: row => row.parent_name,
    }
  ];

  const fields = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
    }
  ];

  const doUpdate = crud.doUpdate('languages');

  async function handleUpdate(e) {
    $session.loading++;
    try {
      error = null;
      await handleUpdate(e);
    } catch (err) {
      error = err.message;
    }
    $session.loading--;
  }
</script>

<main>
  <h2>Languages</h2>
  <Alert type="error" message={error} />
  <Table
    {columns}
    {rows}
    {editable}
    on:update={handleUpdate}
  />

  {#if editable}
    <h3>Create proto-language</h3>
    <Form
      {fields}
      submitLabel="Create"
      class="create-protolang"
      on:submit={handleSubmit}
    />
  {/if}
</main>

<style>
  :global(.create-protolang > div) {
    grid-template-columns: 30% 70% !important;
  }
</style>