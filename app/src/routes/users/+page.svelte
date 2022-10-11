<script>
  import CreateForm from './CreateForm.svelte';
  import Table from './Table.svelte';
  import { session } from '$lib/stores';

  export let data;
  $: ({ rows } = data);

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
  admin={$session.user?.admin}
  on:refresh={handleRefresh}
/>

{#if $session.user?.admin}
  <h3>Create new user</h3>
  <CreateForm
    on:refresh={handleRefresh}
  />
{/if}
