<script>
  import { createEventDispatcher, tick } from 'svelte';
  const dispatch = createEventDispatcher();

  export let columns;
  export let rows;
  export let editable = false;
  let editingCell = null;

  for (const column of columns) {
    if (!('value' in column)) {
      column.value = row => row[column.key] ?? '';
    }
  }

  async function handleClick(e, column, row) {
    editingCell = { column, row };
    await tick();
    e.currentTarget.focus();

    const sel = window.getSelection();
    const range = new Range();
    range.selectNode(e.currentTarget.firstChild);
    sel.empty();
    sel.addRange(range);
  }

  function handleBlur(e) {
    editingCell = null;
    const sel = window.getSelection();
    sel.empty();
  }

  function handleKeyDown(e) {
    if (e.currentTarget.isContentEditable && e.keyCode === 13) { // enter
      e.preventDefault();
      const { row, column } = editingCell;
      if (e.currentTarget.textContent !== row[column.key]) {
        dispatch('update', { id: row.id, row: { [column.key]: e.currentTarget.textContent } });
      }
      e.currentTarget.blur();
    }
  }

  function match(editingCell, column, row) {
    return editingCell && editingCell.column === column && editingCell.row === row ? 'true' : null;
  }
</script>

<table>
  <thead>
    {#each columns as column}
      <th><span>{column.title}</span></th>
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
                on:keydown={match(editingCell, column, row) && handleKeyDown}
              ><span>{column.value(row)}</span></td>
            {/if}
          {:else}
            <td><span>{column.value(row)}</span></td>
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
