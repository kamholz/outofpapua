<script>
  import TableCell from '$components/TableCell.svelte';
  import TableControls from '$components/TableControls.svelte';
  import { fly } from 'svelte/transition';
  import { sineIn, sineOut } from 'svelte/easing';

  export let row;
  export let columns;
  export let controls;
  export let editable;

  function handleRefresh() {
    row = row;
  }
</script>

<tr in:fly|local={{ easing: sineIn }} out:fly|local={{ easing: sineOut }}>
  {#each columns as column (column.key)}
    <TableCell
      {row}
      {column}
      {editable}
      on:edit
      on:update
    />
  {/each}
  {#if controls}
    <TableControls
      {row}
      {controls}
      on:delete 
      on:select 
      on:refresh={handleRefresh} 
    />
  {/if}
</tr>

<style lang="scss">
  tr:nth-child(even) {
    background-color: $light_gray;
  }

  tr:nth-child(odd) {
    background-color: white;
  }
</style>