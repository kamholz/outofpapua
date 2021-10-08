<script context="module">
  import { requireAuthLoad } from '$actions/auth';

  export const load = requireAuthLoad(async ({ fetch }) => {
    const props = {};
    const json = await reload(fetch);
    if (!json) {
      return { status: 500 };
    }
    Object.assign(props, json);

    return { props };
  });

  export async function reload(fetch) {
    const res = await fetch('/api/saved_map.json');
    return res.ok ? res.json() : null;
  }
</script>

<script>
  import Table from './_Table.svelte';

  export let rows;

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