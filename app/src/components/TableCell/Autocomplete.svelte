<script>
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatch = createEventDispatcher();
  import Typeahead from 'svelte-typeahead';

  export let row;
  export let column;
  let td;
  let autocompleteRef;
  const dataStore = column.autocomplete.data;

  onMount(async () => {
    dispatch('edit', td);
    autocompleteRef.focus();
    autocompleteRef.select();
  });

  function handleAutocompleteSelect(e) {
    const { selected, original } = e.detail;
    const { initialValue, serializedValue, updateKey, updateValue } = column.autocomplete;
    if (selected === initialValue(row)) { // nothing to do
      dispatch('deactivate');
    } else {
      const updatedValue = original ? updateValue(original) : null;
      dispatch('update', {
        id: row.id,
        values: { [updateKey]: updatedValue },
        onSuccess: () => {
          row[column.key] = serializedValue(selected);
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