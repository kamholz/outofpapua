<script>
  import ListItem from './_ListItem.svelte';
  import Paginator from '$components/Paginator.svelte';
  import { writable } from 'svelte/store';

  export let rows;
  export let query;
  export let pageCount;
  const collapsedRows = $rows.map(() => writable(false));
</script>

{#if pageCount > 1}
  <Paginator {query} {pageCount} />
{/if}

<hr>

{#each $rows as set, i (set.id)}
  <ListItem {set} collapsed={collapsedRows[i]} />
  <hr>
{/each}

{#if pageCount > 1}
  <Paginator {query} {pageCount} />
{/if}

<style lang="scss">
  @include hr;
</style>