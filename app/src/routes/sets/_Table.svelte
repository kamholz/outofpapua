<script>
  import Paginator from '$components/Paginator.svelte';

  export let rows;
  export let query;
  export let pageCount;
</script>

{#if pageCount > 1}
  <Paginator {query} {pageCount} />
{/if}

{#each $rows as set (set.id)}
  <h3>Set: {set.title ?? set.id}</h3>
  <a href="/sets/{set.id}">Link</a>
{/each}

{#if pageCount > 1}
  <Paginator {query} {pageCount} />
{/if}
