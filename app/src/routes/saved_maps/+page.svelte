<script>
  import Table from './Table.svelte';
  import { reload } from './+page';

  export let data;
  $: ({ rows } = data);

  async function handleRefresh() {
    rows = (await reload(fetch))?.rows;
  }
</script>

<svelte:head>
  <title>Saved Maps | Out of Papua</title>
</svelte:head>

<h2>Saved maps</h2>
{#if rows.length}
  <Table
    {rows}
    on:refresh={handleRefresh}
  />
{:else}
  <div class="notfound">no maps found</div>
{/if}