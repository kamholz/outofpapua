<script>
  export let entry;
</script>
{#if entry.record_id}
  <a href="/records/{entry.record_id}"><slot /></a>
{:else}
  <slot />
{/if}
