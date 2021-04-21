<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let row;
  export let column;
  export let editable;
  export let active = false;
  let elt;

  function mountEditCell(elt) {
    dispatch('edit', elt);
    elt.focus();

    const sel = window.getSelection();
    const range = new Range();
    range.selectNode(elt.firstChild);
    sel.empty();
    sel.addRange(range);
  }

  async function handleClick(e) {
    active = true;
  }

  function handleBlur(e) {
    active = false;
    const sel = window.getSelection();
    sel.empty();
  }

  function handleKeyDown(e) {
    if (e.keyCode === 13) { // enter
      e.preventDefault();
      const text = elt.textContent.trim();
      if (text === row[column.key]) { // nothing to do
        elt.blur();
      } else {
        dispatch('update', {
          id: row.id,
          values: { [column.key]: text },
          onSuccess: () => {
            row[column.key] = text;
            elt.blur();
          }
        });
      }
    }
  }

  function handleCheckbox(e) {
    const value = e.currentTarget.checked;
    dispatch('update', {
      id: row.id,
      values: { [column.key]: value },
      onSuccess: () => {
        row[column.key] = value;
      }
    });
  }

  function isEditable(value, row) {
    return typeof(value) === 'function'
      ? value(row)
      : value;
  }
</script>

{#if editable && isEditable(column.editable, row)}
  {#if column.type === 'checkbox'}
    <td><input
      type="checkbox"
      checked={row[column.key]}
      on:click={handleCheckbox}
    ></td>
  {:else if active}
    <td
      contenteditable="true"
      bind:this={elt}
      use:mountEditCell
      on:blur={handleBlur}
      on:keydown={handleKeyDown}
    ><span>{column.value(row)}</span></td>
  {:else}
    <td
      on:click={handleClick}
    ><span>{column.value(row)}</span></td>
  {/if}
{:else}
  <td><span>{column.value(row)}</span></td>
{/if}

