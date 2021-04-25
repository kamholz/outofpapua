<script context="module">
  import { writable } from 'svelte/store';
  import { requireAuthLoad } from '$actions/auth';

  export const load = requireAuthLoad(async ({ fetch, session }) => {
    const res = await fetch('/api/users.json');
    if (!res.ok) {
      return { status: 500, error: 'Internal error' };
    }
    return {
      props: { rows: writable(await res.json()) }
    };
  });
</script>

<script>
  import { session } from '$app/stores';
  import UserTable from '$components/tables/UserTable.svelte';

  export let rows;
</script>

<main>
  <h2>Users</h2>
  <UserTable
    {rows}
    admin={$session.user.admin}
  />
</main>
