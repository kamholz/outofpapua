<script>
  import ListItem from './_ListItem.svelte';
  import Paginator from '$components/Paginator.svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { fade } from 'svelte/transition';
  import { normalizeQuery } from '$lib/util';
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  export let rows;
  export let query;
  export let pageCount;
  export let rowCount;
  export let lang1;
  export let lang2;
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

  const setSummaryCache = writable({});
  setContext('setSummaryCache', setSummaryCache);

  function collapseAll(state) {
    for (const id of Object.keys(collapsedRows)) {
      collapsedRows[id].set(state);
    }
  }

  function handleClick(e) {
    e.preventDefault();
    const query = normalizeQuery(new URL(e.currentTarget.href).searchParams);
    dispatch('refresh', query);
  }
</script>

<h3>{lang1.name}</h3>
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
  <Paginator {query} {pageCount} on:click={handleClick} />
{/if}
{#key $rows}
  <div transition:fade|local>
    {#each $rows as row (row.id)}
      <ListItem
        entry={row}
        {lang2}
        collapsed={collapsedRows[row.id]}
        {multilang}
      />
      <hr>
    {/each}
  </div>
{/key}
{#if pageCount > 1}
  <Paginator {query} {pageCount} on:click={handleClick} />
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