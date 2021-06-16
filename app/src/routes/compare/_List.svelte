<script>
  import ListItem from './_ListItem.svelte';
  import Paginator from '$components/Paginator.svelte';
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  export let name;
  export let pageCount;
  export let pageParam;
  export let rowCount;
  export let query;
  export let rows;
  export let lang2;
  export let multilang;

  const collapsedRows = {};
  for (const row of $rows) {
    if (row.compare_entries) {
      collapsedRows[row.id] = writable(false);
    }
  }

  const setSummaryCache = writable({});
  setContext('setSummaryCache', setSummaryCache);

  function collapseAll(state) {
    for (const id of Object.keys(collapsedRows)) {
      collapsedRows[id].set(state);
    }
  }
</script>

<h3>{name}</h3>
<div class="info">
  Total entries: {rowCount}
</div>

{#if Object.keys(collapsedRows).length}
  <hr>
  <div>
    <button on:click={() => collapseAll(true)}>Collapse All</button>
    <button on:click={() => collapseAll(false)}>Expand All</button>
  </div>
{/if}

<hr>
{#if pageCount > 1}
  <Paginator {query} {pageCount} {pageParam} />
{/if}
{#each $rows as row (row.id)}
  <ListItem entry={row} {lang2} collapsed={collapsedRows[row.id]} {multilang} />
  <hr>
{/each}

<style lang="scss">
  .info {
    margin-block: $item_sep;
  }

  button {
    margin-inline: 0 10px;
  }

  @include hr;
</style>