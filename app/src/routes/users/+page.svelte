<script>
  import CreateForm from './CreateForm.svelte';
  import Table from './Table.svelte';
  import { page } from '$app/stores';

  export let rows;

  async function handleRefresh() {
    rows = (await reload(fetch))?.rows;
  }
</script>

<svelte:head>
  <title>Users | Out of Papua</title>
</svelte:head>

<h2>Users</h2>
<Table
  {rows}
  admin={$page.data.user?.admin}
  on:refresh={handleRefresh}
/>

{#if $page.data.user?.admin}
  <h3>Create new user</h3>
  <CreateForm
    on:refresh={handleRefresh}
  />
{/if}
