<script>
  import ExportSet from './ExportSet.svelte';
  import { glossesSummaryNoLanguage, toolboxMarkup } from '$lib/util';

  export let entry;
  $: glosses = entry.senses?.[0]?.glosses;
</script>

<div>
  <h4>{entry.headword} {#if glosses}{@html toolboxMarkup(glossesSummaryNoLanguage(glosses))}{/if}</h4>

  {#each entry.sets as set}
    <ExportSet {set} />
  {/each}
</div>
