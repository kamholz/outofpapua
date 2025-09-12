<script>
  import Table from './Table.svelte';
  import { invalidateAll } from '$app/navigation';
  import { pageLoading } from '$lib/stores';

  let { data } = $props();
  let { rows } = $derived(data);

  async function handleRefresh() {
    $pageLoading++;
    await invalidateAll();
    $pageLoading--;
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
