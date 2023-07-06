<script>
  import Glosses from '$components/Glosses.svelte';

  export let details;
</script>

{#if details?.entry_headword}
  {details.entry_language_name} <em>{details.entry_headword}</em>
  <Glosses glosses={details.entry_senses[0]?.glosses} single />
{:else}
  {'<unknown>'}
{/if}