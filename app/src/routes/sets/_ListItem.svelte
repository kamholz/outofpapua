<script>
  import CollapseIndicator from '$components/CollapseIndicator.svelte';
  import Icon from 'svelte-awesome';
  import ListItemMember from './_ListItemMember.svelte';
  import { faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';
  import { faCircle as faCircleSolid } from '@fortawesome/free-solid-svg-icons';
  import { slide } from 'svelte/transition';

  export let set;
  export let collapsed;
  export let selection;

  function handleSelect() {
    if (selection.has(set.id)) {
      selection.delete(set.id);
    } else {
      selection.add(set.id);
    }
    selection = selection;
  }
</script>

<div class="header">
  <div>
    <CollapseIndicator bind:collapsed />
    <strong>Set: <a href="/sets/{set.id}">{set.name_auto.txt}</a></strong>
  </div>
  <span title="Select" on:click={handleSelect}>
    <Icon data={selection.has(set.id) ? faCircleSolid : faCircleRegular} />
  </span>
</div>
{#if !collapsed}
  <div class="table" transition:slide|local={{ duration: 200 }}>
    {#each set.members as member (member.entry.id)}
      <ListItemMember {member} />
    {/each}
  </div>
{/if}

<style lang="scss">
  .header {
    display: flex;
    justify-content: space-between;
    > div {
      display: flex;
    }
  }

  .table {
    margin-block-start: 6px;
    display: grid;
    grid-template-columns: 30% 25% auto;
    column-gap: 14px;
  }
</style>