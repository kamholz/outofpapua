<script>
  import { originSummary } from '$lib/util';

  let { entry } = $props();
</script>

{#if entry.origin}
  , <em>origin:</em> {originSummary(entry)}
{/if}
