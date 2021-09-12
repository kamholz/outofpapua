<script context="module">
  import { requireAuthLoad } from '$actions/auth';

  export const load = requireAuthLoad(async ({ fetch }) => {
    const json = await reload(fetch);
    if (!json) {
      return { status: 500 };
    }
    return {
      props: { rows: json.rows },
    };
  });

  export async function reload(fetch) {
    const res = await fetch('/api/user.json');
    return res.ok ? res.json() : null;
  }
</script>

<script>
  import CreateForm from './_CreateForm.svelte';
  import Table from './_Table.svelte';
  import { session } from '$app/stores';

  export let rows;

  async function handleRefresh() {
    rows = (await reload(fetch))?.rows;
  }
</script>

<h2>Users</h2>
<Table
  {rows}
  admin={$session.user?.admin}
  on:refresh={handleRefresh}
/>

{#if $session.user?.admin}
  <h3>Create new user</h3>
  <CreateForm
    on:refresh={handleRefresh}
  />
{/if}
