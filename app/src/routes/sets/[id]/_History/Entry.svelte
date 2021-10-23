<script>
  import { glossSummaryNoLanguage } from '$lib/util';

  export let details;
</script>

{#if details?.entry_headword}
  {details.entry_language_name} <em>{details.entry_headword}</em>
  {#if details.entry_senses[0]?.glosses?.[0]}
    {glossSummaryNoLanguage(details.entry_senses[0].glosses[0])}
  {/if}
{:else}
  {'<unknown>'}
{/if}