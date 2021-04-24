<script>
  import { createEventDispatcher, tick } from 'svelte';
  const dispatch = createEventDispatcher();
  import Typeahead from 'svelte-typeahead';

  export let row;
  export let column;
  export let editable;
  export let active = false;
  let td;
  let autocompleteRef;

  async function mountEditCell(td) {
    dispatch('edit', td);
    if (column.type === 'text') {
      td.focus();
      const sel = window.getSelection();
      const range = new Range();
      range.selectNode(td.firstChild);
      sel.empty();
      sel.addRange(range);
    } else if (column.type === 'autocomplete') {
      await tick();
      if (autocompleteRef) {
        autocompleteRef.focus();
        autocompleteRef.select();
      }
    }
  }

  async function handleClick(e) {
    active = true;
  }

  function handleDeactivate(e) {
    active = false;
    if (column.type === 'text') {
      const sel = window.getSelection();
      sel.empty();
    }
  }

  function handleKeyDown(e) {
    if (e.keyCode === 13) { // enter
      console.log('hello');
      return;
      e.preventDefault();
      const text = td.textContent.trim();
      if (text === row[column.key]) { // nothing to do
        td.blur();
      } else {
        dispatch('update', {
          id: row.id,
          values: { [column.key]: text },
          onSuccess: () => {
            row[column.key] = text;
            td.blur();
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
    {#if column.type === 'autocomplete'}
      <td
        class="autocomplete"
        bind:this={td}
        use:mountEditCell
        on:deactivate={handleDeactivate}
      ><Typeahead
        value={column.autocompleteValue?.(row) || "test"}
        placeholder=""
        focusAfterSelect
        hideLabel
        limit={10}
        {...column.autocomplete}
        bind:searchRef={autocompleteRef}
      /></td>
    {:else}
      <td
        contenteditable="true"
        bind:this={td}
        use:mountEditCell
        on:deactivate={handleDeactivate}
        on:blur={handleDeactivate}
        on:keydown={handleKeyDown}
      ><span>{column.value(row)}</span></td>
    {/if}
  {:else}
    <td
      on:click={handleClick}
    ><span>{column.value(row)}</span></td>
  {/if}
{:else}
  <td><span>{column.value(row)}</span></td>
{/if}

<style lang="scss">
  td.autocomplete {
    padding-block: 0;

    :global([data-svelte-typeahead]) {
      :global(input) {
        margin: 0;
        padding-block: 4px;
        padding-inline: 3px;
        inline-size: 10em;
      }

      :global(ul) {
        margin: 0;
        margin-block-start: 3px;
      }

      :global(li) {
        cursor: default;
      }

      :global(mark) {
        color: unset;
        background-color: unset;
        font-weight: bold;
      }
    }
  }
</style>