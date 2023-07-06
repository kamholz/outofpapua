<script>
  import ExportSetMember from './ExportSetMember.svelte';
  import { getContext } from 'svelte';
  const settings = getContext('settings');

  export let set;
</script>

<div>
  {#if $settings.include_ancestors && set.members.ancestor.length}
    <h4>
      Ancestors:
    </h4>
    {#each set.members.ancestor as member}
      <ExportSetMember {member} />
    {/each}
  {/if}

  {#if $settings.include_descendants && set.members.descendant.length}
    <h4>
      Descendants:
    </h4>
    {#each set.members.descendant as member}
      <ExportSetMember {member} />
    {/each}
  {/if}

  {#if $settings.include_borrowed && set.members.borrowed.length}
    <h4>
      Borrowed:
    </h4>
    {#each set.members.borrowed as member}
      <ExportSetMember {member} />
    {/each}
  {/if}
</div>

<style>  
  div {
    margin-inline-start: 40px;
  }
</style>