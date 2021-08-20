<script>
  import ListItem from './_ListItem.svelte';
  import Paginator from '$components/Paginator.svelte';
  import { fade } from 'svelte/transition';

  export let rows;
  export let query;
  export let pageCount;
  export let rowCount;
  export let lang1Name;
  export let lang2Name;
  export let multilang;

  $: collapsedRows = Object.fromEntries(
    rows.filter((row) => row.compare_entries).map((row) => [row.id, false])
  );

  function collapseAll(state) {
    for (const id of Object.keys(collapsedRows)) {
      collapsedRows[id] = state;
    }
  }
</script>

<h3>{lang1Name}</h3>
<div class="info">
  Total entries: {rowCount}
</div>

{#if pageCount > 1}
  <Paginator {query} {pageCount} />
{/if}

{#if Object.keys(collapsedRows).length}
  <hr>
  <div>
    <button type="button" on:click={() => collapseAll(true)}>Collapse All</button>
    <button type="button" on:click={() => collapseAll(false)}>Expand All</button>
  </div>
{/if}

<hr>
{#key rows}
  <div transition:fade|local>
    {#each rows as row (row.id)}
      <ListItem
        entry={row}
        {lang2Name}
        collapsed={collapsedRows[row.id]}
        {multilang}
        on:refresh
      />
      <hr>
    {/each}
  </div>
{/key}
{#if pageCount > 1}
  <Paginator {query} {pageCount} />
{/if}

<style lang="scss">
  .info {
    margin-block: $item_sep;
  }

  @include button-left;
  @include hr;
</style>