<script>
  import Next from '$components/Pagination/Next.svelte';
  import Previous from '$components/Pagination/Previous.svelte';
  import Number from '$components/Pagination/Number.svelte';

  export let query;
  export let numPages;

  function pageUrl(page) {
    return '?' + new URLSearchParams({...query, page});
  }
</script>

<ul>
  {#if query.page > 1}
    <Previous url={pageUrl(query.page - 1)} />
  {/if}

  {#if query.page < numPages}
    <Next url={pageUrl(query.page + 1)} />
  {/if}
</ul>

<style>

</style>