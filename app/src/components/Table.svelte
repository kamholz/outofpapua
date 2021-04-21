<script>
  import { createEventDispatcher } from 'svelte';
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

  async function handleClick(e, { row, column }) {
    editingCell = { row, column };
  }

  function handleBlur(e) {
    editingCell = null;
    const sel = window.getSelection();
    sel.empty();
  }

  function handleKeyDown(e, { row, column }) {
    if (e.keyCode === 13) { // enter
      e.preventDefault();
      const elt = e.currentTarget;
      const text = elt.textContent.trim();
      if (text === row[column.key]) { // nothing to do
        elt.blur();
      } else {
        dispatch('update', {
          id: row.id,
          row: { [column.key]: text },
          onSuccess: () => {
            row[column.key] = text;
            elt.blur();
          }
        });
      }
      function finish() {
        elt.blur();
      }
    }
  }

  function mountEditCell(elt) {
    elt.focus();

    const sel = window.getSelection();
    const range = new Range();
    range.selectNode(elt.firstChild);
    sel.empty();
    sel.addRange(range);
  }

  function match(editingCell, { row, column }) {
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
            {:else if match(editingCell, { row, column })}
              <td
                contenteditable="true"
                use:mountEditCell
                on:blur={handleBlur}
                on:keydown={e => handleKeyDown(e, { row, column })}
              ><span>{column.value(row)}</span></td>
            {:else}
              <td
                on:click={e => handleClick(e, { row, column })}
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
