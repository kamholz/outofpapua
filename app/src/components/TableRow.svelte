<script>
  import TableCell from '$components/TableCell.svelte';
  import TableControls from '$components/TableControls.svelte';
  import { fly } from 'svelte/transition';
  import { sineIn, sineOut } from 'svelte/easing';

  export let row;
  export let columns;
  export let controls;
  export let editable;
  export let editingCell;
</script>

<tr in:fly|local={{ easing: sineIn }} out:fly|local={{ easing: sineOut }}>
  {#each columns as column (column.key)}
    <TableCell
      bind:row
      {column}
      {editable}
      bind:editingCell
      on:update
    />
  {/each}
  {#if controls}
    <TableControls
      bind:row
      {controls}
      on:delete 
      on:select 
    />
  {/if}
</tr>

<style lang="scss">
  tr:nth-child(even) {
    background-color: var(--light-gray);
  }

  tr:nth-child(odd) {
    background-color: white;
  }
</style>