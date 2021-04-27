<script>
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatch = createEventDispatcher();
  import Typeahead from 'svelte-typeahead';

  export let row;
  export let column;
  let td;
  let autocompleteRef;
  const { data, filter, restprops, rowValue, serializedValue, updateKey, updateValue } = column.autocomplete;

  onMount(async () => {
    dispatch('edit', td);
    autocompleteRef.focus();
    autocompleteRef.select();
  });

  function handleSelect(e) {
    const { selected, original } = e.detail;
    if (selected === rowValue(row)) { // nothing to do
      dispatch('deactivate');
    } else {
      const updatedValue = updateValue(original);
      dispatch('update', {
        id: row.id,
        values: { [updateKey]: updatedValue },
        onSuccess: () => {
          row[column.key] = serializedValue(selected);
          row[updateKey] = updatedValue;
          dispatch('deactivate');
        }
      });
    }
  }

  function handleFocusOut() {
    setTimeout(() => {
      if (document.activeElement !== autocompleteRef) {
        dispatch('deactivate');
      }
    }, 300);
  }
</script>

<td
  class="autocomplete"
  bind:this={td}
  on:deactivate
  on:focusout={handleFocusOut}
>
  <Typeahead
    data={$data}
    value={rowValue?.(row) ?? ""}
    placeholder=""
    focusAfterSelect
    hideLabel
    limit={15}
    filter={filter?.(row)}
    {...restprops}
    bind:searchRef={autocompleteRef}
    on:select={handleSelect}
  />
</td>

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