<script>
  import ExportSetMember from './ExportSetMember.svelte';
  import { getContext } from 'svelte';
  const settings = getContext('settings');

  export let set;
</script>

<div>
  {#if $settings.include_descendants && set.members.descendant.length}
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
    margin-block-start: 8px;
    margin-inline-start: 24px;
  }
</style>