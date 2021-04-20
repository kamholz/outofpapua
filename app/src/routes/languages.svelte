<script context="module">
  import Table from '$components/Table.svelte';
  import * as crud from '$actions/crud';
  import { boolean } from '$lib/util';

  export async function load({ fetch, session }) {
    const props = {
      editable: session.user !== null
    };
    const res = await fetch('/api/languages.json');
    if (res.ok) {
      props.rows = await res.json();
    }
    return { props };
  }

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
      type: 'protolanguage',
    }
  ];
</script>

<script>
  export let rows;
  export let editable;
</script>

<main>
  <h2>Languages</h2>
  {#if rows}
    <Table {columns} {rows} {editable} on:update={crud.update("languages")} />
  {:else}
    <span>error</span>
  {/if}
</main>
