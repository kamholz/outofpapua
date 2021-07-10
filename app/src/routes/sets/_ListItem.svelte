<script>
  import Collapsible from '$components/Collapsible.svelte';
  import CollapsibleIndicator from '$components/CollapsibleIndicator.svelte';
  import ListItemMember from './_ListItemMember.svelte';
  import { slide } from 'svelte/transition';

  export let set;
  export let collapsed;
</script>

<Collapsible {collapsed}>
  <div class="header">
    <CollapsibleIndicator />
    <strong>Set: <a href="/sets/{set.id}">{set.title ?? set.id}</a></strong>
  </div>
  {#if !$collapsed}
    <div class="table" transition:slide|local={{ duration: 200 }}>
      {#each set.members as member (member.entry.id)}
        <ListItemMember {member} />
      {/each}
    </div>
  {/if}
</Collapsible>

<style lang="scss">
  .header {
    display: flex;
  }

  .table {
    margin-block-start: 6px;
    display: grid;
    grid-template-columns: 30% 25% auto;
    column-gap: 14px;
  }
</style>