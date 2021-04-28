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
    const res = await fetch('/api/user.json');
    return res.ok ? await res.json() : null;
  }
</script>

<script>
  import { fade } from 'svelte/transition';
  import { session } from '$app/stores';
  import UsersTable from './_Table.svelte';
  import CreateUserForm from './_CreateForm.svelte';

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