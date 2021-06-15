<script>
  import ListItem from './_ListItem.svelte';
  import Paginator from '$components/Paginator.svelte';
  import { writable } from 'svelte/store';

  export let name;
  export let pageCount;
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

  function collapseAll(state) {
    for (const collapsed of Object.values($rows)) {
      collapsed.set(state);
    }
  }
</script>

<h3>{name}</h3>
<div class="info">
  Total entries: {rowCount}
</div>
<hr>
{#if pageCount > 1}
  <Paginator {query} {pageCount} />
{/if}
{#each $rows as row (row.id)}
  <ListItem {row} {lang2} collapsed={collapsedRows[row.id]} {multilang} />
  <hr>
{/each}

<style lang="scss">
  .info {
    margin-block: $item_sep;
  }

  @include hr;
</style>