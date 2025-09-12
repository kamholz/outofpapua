<script>
  import TableCell from '$components/TableCell.svelte';
  import TableControls from '$components/TableControls.svelte';
  import { fly } from 'svelte/transition';
  import { sineIn, sineOut } from 'svelte/easing';

  let {
    row = $bindable(),
    columns,
    controls,
    editable,
    editingCell = $bindable(),
    searchContext,
    searchContextCollapsed = $bindable(),
    children
  } = $props();

  function toggleSearchContextCollapsed() {
    searchContextCollapsed = !searchContextCollapsed;
  }
</script>

<tr in:fly|local={{ easing: sineIn }} out:fly|local={{ easing: sineOut }}>
  {#if searchContext}
    <td onclick={toggleSearchContextCollapsed}>
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
      {@render children?.()}
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
