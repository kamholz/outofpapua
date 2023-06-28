<script>
  import ExportSetMember from './ExportSetMember.svelte';
  import { getContext } from 'svelte';
  const settings = getContext('settings');

  export let set;
</script>

<div>
  {#if $settings.includeAncestors && set.members.ancestor.length}
    <div class="heading">
      Ancestors:
    </div>
    {#each set.members.ancestor as member}
      <ExportSetMember {member} />
    {/each}
  {/if}

  {#if $settings.includeDescendants && set.members.descendant.length}
    <div class="heading">
      Descendants:
    </div>
    {#each set.members.descendant as member}
      <ExportSetMember {member} />
    {/each}
  {/if}

  {#if $settings.includeBorrowed && set.members.borrowed.length}
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