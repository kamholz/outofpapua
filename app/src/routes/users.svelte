<script context="module">
  export async function load({ fetch, session }) {
    if (!session.user) {
      return { status: 401, error: 'Unauthorized' };
    }

    const props = {};
    const res = await fetch('/api/users.json');
    if (res.ok) {
      props.rows = await res.json();
    }
    return { props };
  }
</script>

<script>
  import Table from '$components/Table.svelte';
  import Error from '$components/Error.svelte';
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
    />
  {/if}
</main>
