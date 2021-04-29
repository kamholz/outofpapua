<script>
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatch = createEventDispatcher();
  import { fade } from 'svelte/transition';
  import Svelecte from '$lib/svelecte';

  export let row;
  export let column;
  const { filter, options, labelField, rowKey, searchField, valueField } = column.autocomplete;
  let td;
  let focus;

  let filteredOptions = $options;
  if (filter) {
    filteredOptions = filteredOptions.filter((option) => filter(option, row));
  }

  onMount(async () => {
    dispatch('edit', td);
    focus();
  });

  function handleSelect(e) {
    const option = e.detail;
    const value = option?.[valueField] ?? null;
    if (value === row[rowKey]) { // nothing to do
      dispatch('deactivate');
    } else {
      dispatch('update', {
        id: row.id,
        values: { [rowKey]: value },
        onSuccess: () => {
          row[column.key] = option?.[labelField] ?? null;
          row[rowKey] = value;
          dispatch('deactivate');
        },
      });
    }
  }

  function handleFocusOut() {
    dispatch('deactivate');
  }
</script>

<td
  class="autocomplete"
  bind:this={td}
  on:deactivate
  on:focusout={handleFocusOut}
  in:fade={{ duration: 200 }}
>
  <Svelecte
    options={filteredOptions}
    value={row[rowKey]}
    {valueField}
    {labelField}
    searchField={searchField || labelField}
    placeholder=""
    searchable
    clearable
    on:change={handleSelect}
    bind:focus
  />
</td>

<style lang="scss">
  td.autocomplete {
    padding-block: 0;

    :global(.svelecte-control) :global(.sv-control) {
      background-color: white;
      min-height: unset;
      height: 30px;
      width: 16em;
    }
  }
</style>