<script>
  import TableCell from '$components/TableCell.svelte';
  import TableControls from '$components/TableControls.svelte';

  export let columns;
  export let rows;
  export let editable = false;
  let editingCell = null;
  export let controls = null;

  for (const column of columns) {
    if (!('value' in column)) {
      column.value = row => row[column.key] ?? '';
    }
  }

  function handleEdit(e) {
    if (editingCell !== e.detail) {
      editingCell?.blur();
      editingCell = e.detail;
    }
  }
</script>

<table>
  <thead>
    {#each columns as column}
      <th><span>{column.title}</span></th>
    {/each}
    {#if controls}
      <th></th>
    {/if}
  </thead>
  <tbody>
    {#each rows as row}
      <tr>
        {#each columns as column}
          <TableCell {row} {column} {editable} on:edit={handleEdit} on:update />
        {/each}
        {#if controls}
          <TableControls {row} {controls} on:delete on:edit />
        {/if}
      </tr>
    {/each}
  </tbody>
</table>

<style lang="scss">
  @import '../vars.scss';

  table {
    border: 1px solid black;
    border-collapse: collapse;

    tr:nth-child(even) {
      background-color: $lightgray;
    }

    th {
      text-align: start;
      border-block-end: 1px solid black;
    }

    th, :global(td) {
      padding-block: 3px;
      padding-inline: 10px;
    }

    :global(td[contenteditable="true"]) {
      background-color: white;
    }
  }
</style>
