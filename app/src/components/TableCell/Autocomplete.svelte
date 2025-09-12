<script>
  import Svelecte from '$lib/svelecte';
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatch = createEventDispatcher();
  import { fade } from 'svelte/transition';

  let { row = $bindable(), column, editingCell = $bindable() } = $props();
  const { filter, options, labelField, rowKey, searchField, valueField } = column.autocomplete;
  let focus = $state();

  let filteredOptions = $state(options);
  if (filter) {
    filteredOptions = filteredOptions.filter((option) => filter(option, row));
  }

  onMount(() => {
    focus();
  });

  function handleSelect(e) {
    const option = e.detail;
    const value = option?.[valueField] ?? null;
    if (value === row[rowKey]) { // nothing to do
      editingCell = null;
    } else {
      dispatch('update', {
        id: row.id,
        values: { [rowKey]: value },
        onSuccess: () => {
          row[column.key] = option?.[labelField] ?? null;
          row[rowKey] = value;
          editingCell = null;
        },
      });
    }
  }
</script>

<td
  class="autocomplete"
  onfocusout={() => editingCell = null}
  in:fade|local={{ duration: 200 }}
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
  .autocomplete {
    padding-block: 0;

    :global(.sv-control) {
      background-color: white;
      min-height: unset;
      height: 30px;
      width: 16em;
    }
  }
</style>
