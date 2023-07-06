<script>
  import ExportSet from './ExportSet.svelte';
  import { glossesSummaryPreferred, toolboxMarkup } from '$lib/util';

  export let entry;
  $: glosses = entry.senses?.[0]?.glosses;
</script>

<div>
  <h4>{entry.headword} {#if glosses}{@html toolboxMarkup(glossesSummaryPreferred(glosses))}{/if}</h4>

  {#each entry.sets as set}
    <ExportSet {set} />
  {/each}
</div>

<style>
  h4 {
    margin-block-start: var(--item-sep);
  }
</style>