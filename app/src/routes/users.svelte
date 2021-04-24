<script context="module">
  import { requireAuthLoad } from '$actions/auth';
  import { makeDeleter } from '$actions/crud';

  export const load = requireAuthLoad(async ({ fetch }) => {
    const res = await fetch('/api/users.json');
    if (!res.ok) {
      return { status: 500, error: 'Internal error' };
    }
    return {
      props: { rows: await res.json() }
    };
  });
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
          type: 'edit',
          link: row => row.id === $session.user.id ? '/profile' : `/profile/${row.id}`,
        }
      ]
    :
      null;
</script>

<main>
  <h2>Users</h2>
  <Alert type="error" message={error} />
  {#if rows}
    <Table
      {columns}
      {rows}
      {controls}
    />
  {/if}
</main>
