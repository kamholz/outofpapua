<script>
  import ListItem from './ListItem.svelte';
  import Paginator from '$components/Paginator.svelte';
  import { fade } from 'svelte/transition';

  export let rows;
  export let query;
  export let pageCount;
  export let rowCount;
  export let multiLang;
  export let multiGlosslang;

  $: collapsed = Object.fromEntries(
    rows.filter((row) => row.compare_entries).map((row) => [
      row.id,
      Object.fromEntries(row.compare_entries.map((v) => [v.language_id, false])),
    ])
  );

  // console.log(rows);

  function collapseAll(state) {
    for (const [row_id, lang] of Object.entries(collapsed)) {
      for (const language_id of Object.keys(lang)) {
        collapsed[row_id][language_id] = state;
      }
    }
  }
</script>

<div class="info">
  Total entries: {rowCount}
</div>

{#if pageCount > 1}
  <Paginator {query} {pageCount} />
{/if}

{#if Object.keys(collapsed).length}
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
        {query}
        collapsed={collapsed[row.id]}
        {multiLang}
        {multiGlosslang}
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
    margin-block: var(--item-sep);
  }

  @include button-left;
  @include hr;
</style>
