<script>
  import ListItem from './_ListItem.svelte';
  import Paginator from '$components/Paginator.svelte';

  export let rows;
  export let query;
  export let pageCount;
  const collapsedRows = rows.map(() => false);

  function collapseAll(state) {
    for (const [i] of rows.entries()) {
      collapsedRows[i] = state;
    }
  }
</script>

{#if pageCount > 1}
  <Paginator {query} {pageCount} />
{/if}

<hr>
<div>
  <button on:click={() => collapseAll(true)}>Collapse All</button>
  <button on:click={() => collapseAll(false)}>Expand All</button>
</div>
<hr>

{#each rows as set, i (set.id)}
  <ListItem
    {set}
    collapsed={collapsedRows[i]} 
  />
  <hr>
{/each}

{#if pageCount > 1}
  <Paginator {query} {pageCount} />
{/if}

<style lang="scss">
  button {
    margin-inline: 0 10px;
  }

  @include hr;
</style>