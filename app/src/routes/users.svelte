<script context="module">
  import { session } from '$app/stores';
  import Table from '$components/Table.svelte';
  import Error from '$components/Error.svelte';
  import * as crud from '$actions/crud';
  import { boolean } from '$lib/util';

  export async function load({ fetch, session }) {
    const props = {
      editable: session.user !== null,
    };
    const res = await fetch('/api/users.json');
    if (res.ok) {
      props.rows = await res.json();
    }
    return { props };
  }
</script>

<script>
  export let rows;
  export let editable;
  let error = null;

  const handleUpdate = crud.handleUpdate('users');

  function adminOrSelf(v) {
    return $session.user.admin || v.id === $session.user.id;
  }

  function adminNotSelf(v) {
    return $session.user.admin && v.id !== $session.user.id;
  }

  const columns = [
    {
      key: 'fullname',
      title: 'Name',
      editable: adminOrSelf,
    },
    {
      key: 'username',
      title: 'Email',
      editable: adminOrSelf,
    },
    {
      key: 'admin',
      title: 'Admin',
      value: v => boolean(v.admin),
      editable: adminNotSelf,
      type: 'checkbox',
    }
  ];
</script>

<main>
  <h2>Users</h2>
  {#if error}
    <Error message={error} />
  {/if}
  {#if rows}
    <Table
      {columns}
      {rows}
      {editable}
      on:update={async (e) => error = await handleUpdate(e)}
    />
  {/if}
</main>
