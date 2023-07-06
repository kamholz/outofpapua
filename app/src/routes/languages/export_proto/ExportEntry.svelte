<script>
  import ExportSet from './ExportSet.svelte';
  import Glosses from '$components/Glosses.svelte';

  export let entry;
  $: glosses = entry.senses?.[0]?.glosses;
</script>

<div>
  <h4>{entry.headword} <Glosses {glosses} preferred /></h4>

  {#each entry.sets as set}
    <ExportSet {set} />
  {/each}
</div>

<style>
  h4 {
    margin-block-start: var(--item-sep);
  }
</style>