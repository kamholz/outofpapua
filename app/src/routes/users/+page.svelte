<script>
  import CreateForm from './CreateForm.svelte';
  import Table from './Table.svelte';
  import { invalidateAll } from '$app/navigation';
  import { isAdmin } from '$lib/util';
  import { pageLoading, session } from '$lib/stores';

  export let data;
  $: ({ rows } = data);

  async function handleRefresh() {
    $pageLoading++;
    await invalidateAll();
    $pageLoading--;
  }
</script>

<svelte:head>
  <title>Users | Out of Papua</title>
</svelte:head>

<h2>Users</h2>
<Table
  {rows}
  adminView={isAdmin($session.user)}
  on:refresh={handleRefresh}
/>

{#if isAdmin($session.user)}
  <h3>Create new user</h3>
  <CreateForm
    on:refresh={handleRefresh}
  />
{/if}
