<script>
  import ExportSetMember from "./ExportSetMember.svelte";

  export let set;
  export let includeDescendants;
  export let includeBorrowed;
  export let includeAncestors;
</script>

<div>
  <h4>{set.headword.entry.headword}</h4>

  {#each set.members.self as member}
    <ExportSetMember {member} />
  {/each}

  {#if includeAncestors && set.members.ancestor.length}
    <div class="heading">
      Ancestors:
    </div>
    {#each set.members.ancestor as member}
      <ExportSetMember {member} />
    {/each}
  {/if}

  {#if includeDescendants && set.members.descendant.length}
    <div class="heading">
      Descendants:
    </div>
    {#each set.members.descendant as member}
      <ExportSetMember {member} />
    {/each}
  {/if}

  {#if includeBorrowed && set.members.borrowed.length}
    <div class="heading">
      Borrowed:
    </div>
    {#each set.members.borrowed as member}
      <ExportSetMember {member} />
    {/each}
  {/if}
</div>

<style>  
  .heading {
    text-decoration: underline;
    margin-block-start: 14px;
  }
</style>