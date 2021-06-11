<script>
  import ListItem from './_ListItem.svelte';
  import Paginator from '$components/Paginator.svelte';

  export let rows;
  export let query;
  export let pageCount;
</script>

{#if pageCount > 1}
  <Paginator {query} {pageCount} />
{/if}

<hr>

{#each $rows as set (set.id)}
  <ListItem {set} />
  <hr>
{/each}

{#if pageCount > 1}
  <Paginator {query} {pageCount} />
{/if}

<style lang="scss">
  hr {
    margin-block: 20px;
    block-size: 2px;
    background-color: black;
    border: none;
  }
</style>