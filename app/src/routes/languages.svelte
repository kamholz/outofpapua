<script context="module">
  export async function load({ fetch, session }) {
    const props = {
      editable: session.user !== null
    };
    const res = await fetch('/api/languages.json');
    if (!res.ok) {
      return { status: 500, error: 'Internal error' };
    }
    props.rows = await res.json();
    return { props };
  }
</script>

<script>
  import { session } from '$app/stores';
  import Table from '$components/Table.svelte';
  import Alert from '$components/Alert.svelte';
  import * as crud from '$actions/crud';
  import { boolean } from '$lib/util';

  export let rows;
  export let editable;
  let error = null;

  const columns = [
    {
      key: 'name',
      title: 'Language',
      editable: true,
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
      type: 'protolanguage',
    }
  ];

  const handleUpdate = crud.handleUpdate('languages');

  async function doUpdate(e) {
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
  {#if rows}
    <Table
      {columns}
      {rows}
      {editable}
      on:update={doUpdate}
    />
  {/if}
</main>
