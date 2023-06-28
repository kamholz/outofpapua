<script>
  import ExportSet from "./ExportSet.svelte";

  export let entry;
</script>

<div>
  <h4>{entry.headword}</h4>

  {#each entry.sets as set}
    <ExportSet {set} />
  {/each}
</div>
