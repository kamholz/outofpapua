<script>
  import { tick } from 'svelte';

  export let columns;
  export let rows;
  export let editable = false;
  let editingCell;

  for (const column of columns) {
    if (!('value' in column)) {
      column.value = row => row[column.key] ?? '';
    }
  }

  async function handleClick(e, column, row) {
    editingCell = [column, row];
    await tick();
    e.target.focus();

    const range = new Range();
    range.selectNode(e.target);
    const sel = window.getSelection();
    sel.empty();
    sel.addRange(range);
  }

  function handleBlur() {
    editingCell = null;
  }

  function match(editingCell, column, row) {
    return editingCell && editingCell[0] === column && editingCell[1] === row ? 'true' : null;
  }
</script>

<table>
  <thead>
    {#each columns as column}
      <th>{column.title}</th>
    {/each}
  </thead>
  <tbody>
    {#each rows as row}
      <tr>
        {#each columns as column}
          {#if editable && column.editable}
            {#if column.type === 'checkbox'}
              <td><input type="checkbox" checked={row[column.key]} on:click={e => column.handleUpdate(row, e.target.checked)}></td>
            {:else}
              <td
                contenteditable={match(editingCell, column, row)}
                on:click={e => handleClick(e, column, row)}
                on:blur={handleBlur}
              >{column.value(row)}</td>
            {/if}
          {:else}
            <td>{column.value(row)}</td>
          {/if}
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<style lang="scss">
  @import '../vars.scss';

  table {
    border: 1px solid black;
    border-collapse: collapse;
  }

  tr:nth-child(even) {
    background-color: $lightgray;
  }

  th {
    text-align: start;
    border-block-end: 1px solid black;
  }

  th, td {
    padding-block: 3px;
    padding-inline: 10px;
  }

  td[contenteditable="true"] {
    background-color: white;
  }
</style>
