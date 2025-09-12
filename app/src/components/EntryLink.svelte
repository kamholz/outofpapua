<script>
  let { entry, children } = $props();
</script>
{#if entry.record_id}
  <a href="/records/{entry.record_id}">{@render children?.()}</a>
{:else}
  {@render children?.()}
{/if}
