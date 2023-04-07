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
  export let searchContext;
  export let searchContextCollapsed;

  function toggleSearchContextCollapsed() {
    searchContextCollapsed = !searchContextCollapsed;
  }
</script>

<tr in:fly|local={{ easing: sineIn }} out:fly|local={{ easing: sineOut }}>
  {#if searchContext}
    <td on:click={toggleSearchContextCollapsed}>
      { searchContextCollapsed ? '▶' : '▼'}
    </td>
  {/if}
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
      on:link
    />
  {/if}
</tr>

{#if searchContext}
  <tr class:collapsed={searchContextCollapsed}>
    <td></td>
    <td colspan={columns.length} class="context">
      <slot />
    </td>
    {#if controls}
      <td></td>
    {/if}
  </tr>
{/if}

<style>
  .collapsed {
    display: none;
  }
</style>