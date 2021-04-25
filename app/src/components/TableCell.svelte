<script>
  import TableCellAutocomplete from '$components/TableCell/Autocomplete.svelte';
  import TableCellCheckbox from '$components/TableCell/Checkbox.svelte';
  import TableCellInput from '$components/TableCell/Input.svelte';

  export let row;
  export let column;
  export let editable;
  export let active = false;

  function isEditable(row) {
    return typeof(column.editable) === 'function'
      ? column.editable(row)
      : column.editable;
  }

  function handleActivate() {
    active = true;
  }

  function handleDeactivate() {
    active = false;
  }
</script>

{#if editable && isEditable(row)}
  {#if column.type === 'checkbox'}
    <TableCellCheckbox
      {row}
      {column}
      on:update
    />
  {:else if active}
    {#if column.type === 'autocomplete'}
      <TableCellAutocomplete
        {row}
        {column}
        on:edit
        on:update
        on:deactivate={handleDeactivate}
      />
    {:else}
      <TableCellInput
        {row}
        {column}
        on:edit
        on:update
        on:deactivate={handleDeactivate}
      />
    {/if}
  {:else}
    <td
      on:click={handleActivate}
    >
      <span>{column.value(row)}</span>
    </td>
  {/if}
{:else}
  <td>
    <span>{column.value(row)}</span>
  </td>
{/if}