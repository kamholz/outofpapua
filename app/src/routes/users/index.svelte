<script context="module">
  import { requireAuthLoad } from '$actions/auth';
  import { writable } from 'svelte/store';

  export const load = requireAuthLoad(async ({ fetch }) => {
    const json = await reload(fetch);
    if (!json) {
      return { status: 500, error: 'Internal error' };
    }
    return {
      props: { rows: writable(json.rows) },
    };
  });

  export async function reload(fetch) {
    const res = await fetch('/api/user.json');
    return res.ok ? res.json() : null;
  }
</script>

<script>
  import CreateUserForm from './_CreateForm.svelte';
  import UsersTable from './_Table.svelte';
  import { fade } from 'svelte/transition';
  import { session } from '$app/stores';

  export let rows;

  async function handleRefresh() {
    $rows = (await reload(fetch)).rows;
  }
</script>

<div in:fade={{ duration: 200 }}>
<h2>Users</h2>
<UsersTable
  {rows}
  admin={$session.user?.admin}
  on:refresh={handleRefresh}
/>

{#if $session.user?.admin}
  <h3>Create new user</h3>
  <CreateUserForm
    on:refresh={handleRefresh}
  />
{/if}
</div>
