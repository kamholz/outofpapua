<script>
  import ExportSetMember from "./ExportSetMember.svelte";

  export let set;
  export let ancestors;
  export let includeDescendants;
  export let includeBorrowed;
  export let includeAncestors;
</script>

<div>
  <h4>{set.headword}</h4>

  {#each set.members as member}
    <ExportSetMember {member} {ancestors} {includeDescendants} {includeBorrowed} {includeAncestors} />
  {/each}
</div>
