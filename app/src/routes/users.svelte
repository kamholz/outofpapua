<script context="module">
  import { requireAuthLoad } from '$actions/auth';
  import { makeDeleter } from '$actions/crud';

  export const load = requireAuthLoad(async ({ fetch }) => {
    return {
      props: {
        rows: await loadUsers(fetch)
      }
    };
  });

  async function loadUsers(fetch) {
    const res = await fetch('/api/users.json');
    return res.ok ? await res.json() : null;
  }
</script>

<script>
  import { session } from '$app/stores';
  import Table from '$components/Table.svelte';
  import Alert from '$components/Alert.svelte';
  import { boolean } from '$lib/util';

  export let rows;
  let error = null;

  const columns = [
    {
      key: 'fullname',
      title: 'Name',
    },
    {
      key: 'username',
      title: 'Email',
    },
    {
      key: 'admin',
      title: 'Admin',
      value: v => boolean(v.admin),
    }
  ];

  const controls = $session.user.admin
    ?
      [
        {
          type: 'delete',
          key: 'fullname',
          candelete: row => row.id !== $session.user.id,
        }
      ]
    :
      null;

  const del = makeDeleter('users');

  async function handleDelete(e) {
    $session.loading++;
    try {
      await del(e.detail.id);
      rows = await loadUsers(fetch);
    } catch (err) {
      error = err.message;
    }
    $session.loading--;
  }
</script>

<main>
  <h2>Users</h2>
  <Alert type="error" message={error} />
  {#if rows}
    <Table
      {columns}
      {rows}
      {controls}
      on:delete={handleDelete}
    />
  {/if}
</main>
