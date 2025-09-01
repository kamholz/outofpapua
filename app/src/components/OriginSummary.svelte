<script>
  import { originSummary } from '$lib/util';

  export let entry;
</script>

{#if entry.origin}
  , <em>origin:</em> {originSummary(entry)}
{/if}
