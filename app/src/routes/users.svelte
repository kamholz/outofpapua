<script context="module">
  import { writable } from 'svelte/store';
  import { requireAuthLoad } from '$actions/auth';

  export const load = requireAuthLoad(async ({ fetch, session }) => {
    const json = await reload(fetch);
    if (!json) {
      return { status: 500, error: 'Internal error' };
    }
    return {
      props: { rows: writable(json.rows) }
    };
  });

  export async function reload(fetch) {
    const res = await fetch('/api/users.json');
    return res.ok ? await res.json() : null;
  }
</script>

<script>
  import { session } from '$app/stores';
  import UserTable from '$components/tables/UserTable.svelte';
  import NewUserForm from '$components/forms/NewUserForm.svelte';

  export let rows;

  async function handleRefresh() {
    $rows = (await reload(fetch)).rows;
  }
</script>

<main>
  <h2>Users</h2>
  <UserTable
    {rows}
    admin={$session.user?.admin}
    on:refresh={handleRefresh}
  />

  {#if $session.user?.admin}
    <h3>Create new user</h3>
    <NewUserForm
      on:refresh={handleRefresh}
    />
  {/if}
</main>
