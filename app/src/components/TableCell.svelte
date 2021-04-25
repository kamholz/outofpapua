<script>
  import { createEventDispatcher, tick } from 'svelte';
  const dispatch = createEventDispatcher();
  import Typeahead from 'svelte-typeahead';
  import { nullify } from '$lib/util';

  export let row;
  export let column;
  export let editable;
  export let active = false;
  let autocompleteRef;
  const dataStore = column.autocomplete?.data;

  function isEditable(row) {
    return typeof(column.editable) === 'function'
      ? column.editable(row)
      : column.editable;
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

  function handleClick() {
    active = true;
  }

  function handleDeactivate() {
    active = false;
    if (column.type === 'text') {
      const sel = window.getSelection();
      sel.empty();
    }
  }

  function handleFocusOut() {
    setTimeout(() => {
      if (document.activeElement !== autocompleteRef) {
        active = false;
      }
    }, 300);
  }

  function handleKeyDown(e) {
    if (e.keyCode === 13) { // enter
      e.preventDefault();
      const text = nullify(e.currentTarget.textContent.trim());
      if (text === row[column.key]) { // nothing to do
        handleDeactivate();
      } else {
        dispatch('update', {
          id: row.id,
          values: { [column.key]: text },
          onSuccess: () => {
            row[column.key] = text;
            handleDeactivate();
          }
        });
      }
    }
  }

  function handleAutocompleteSelect(e) {
    const { selected, original } = e.detail;
    const { initialValue, serializedValue, updateKey, updateValue } = column.autocomplete;
    if (selected === initialValue(row)) { // nothing to do
      handleDeactivate();
    } else {
      const updatedValue = original ? updateValue(original) : null;
      dispatch('update', {
        id: row.id,
        values: { [updateKey]: updatedValue },
        onSuccess: () => {
          row[column.key] = serializedValue(selected);
          handleDeactivate();
        }
      });
    }
  }
</script>

{#if editable && isEditable(row)}
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
        use:mountEditCell
        on:deactivate={handleDeactivate}
        on:focusout={handleFocusOut}
      >
        <Typeahead
          data={$dataStore}
          value={column.autocomplete.initialValue?.(row) ?? ""}
          placeholder=""
          focusAfterSelect
          hideLabel
          limit={10}
          {...column.autocomplete.restprops}
          bind:searchRef={autocompleteRef}
          on:select={handleAutocompleteSelect}
        />
      </td>
    {:else}
      <td
        contenteditable="true"
        use:mountEditCell
        on:deactivate={handleDeactivate}
        on:blur={handleDeactivate}
        on:keydown={handleKeyDown}
      >
        <span>{column.value(row)}</span>
      </td>
    {/if}
  {:else}
    <td
      on:click={handleClick}
    >
      <span>{column.value(row)}</span>
    </td>
  {/if}
{:else}
  <td>
    <span>{column.value(row)}</span>
  </td>
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