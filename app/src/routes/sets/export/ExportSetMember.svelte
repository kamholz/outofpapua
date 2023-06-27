<script>
  export let member;
  export let ancestors;
  export let includeDescendants;
  export let includeBorrowed;
  export let includeAncestors;
</script>

<div>
  {member.entry.headword}
</div>

<style>
  div {
    margin-block: 4px;
  }
</style>