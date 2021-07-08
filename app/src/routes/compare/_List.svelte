<script>
  import ListItem from './_ListItem.svelte';
  import Paginator from '$components/Paginator.svelte';
  import { fade } from 'svelte/transition';
  import { writable } from 'svelte/store';

  export let rows;
  export let query;
  export let editable;
  export let pageCount;
  export let rowCount;
  export let lang1Name;
  export let lang2Name;
  export let multilang;

  let collapsedRows;
  $: {
    collapsedRows = {};
    for (const row of $rows) {
      if (row.compare_entries) {
        collapsedRows[row.id] = writable(false);
      }
    }
  }

  function collapseAll(state) {
    for (const id of Object.keys(collapsedRows)) {
      collapsedRows[id].set(state);
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
    <button on:click={() => collapseAll(true)}>Collapse All</button>
    <button on:click={() => collapseAll(false)}>Expand All</button>
  </div>
{/if}

<hr>
{#key $rows}
  <div transition:fade|local>
    {#each $rows as row (row.id)}
      <ListItem
        entry={row}
        {lang2Name}
        collapsed={collapsedRows[row.id]}
        {multilang}
        {editable}
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

  button {
    margin-inline: 0 10px;
  }

  @include hr;
</style>