<script>
  import Senses from '$components/Senses.svelte';
  import TableCellAutocomplete from '$components/TableCell/Autocomplete.svelte';
  import TableCellCheckbox from '$components/TableCell/Checkbox.svelte';
  import TableCellInput from '$components/TableCell/Input.svelte';
  import { fade } from 'svelte/transition';

  let {
    row,
    column,
    editable,
    editingCell = $bindable()
  } = $props();

  let { type, value } = $derived(column);
  let cellEditable = $derived(editable &&
    (typeof(column.editable) === 'function' ? column.editable(row) : column.editable));
  let href = $derived(!cellEditable && column.link && column.link(row));

  function handleActivate() {
    editingCell = [row.id, column.key];
  }
</script>

{#if type === 'checkbox'}
  <TableCellCheckbox
    {row}
    {column}
    on:update
  />
{:else if editingCell && editingCell[0] === row.id && editingCell[1] === column.key}
  {#if type === 'autocomplete'}
    <TableCellAutocomplete
      {row}
      {column}
      bind:editingCell
      on:update
    />
  {:else}
    <TableCellInput
      {row}
      {column}
      bind:editingCell
      on:update
    />
  {/if}
{:else}
  {#if type === 'senses'}
    <td onclick={cellEditable ? handleActivate : null}>
      <Senses senses={value(row)} multiGlosslang={column.multiGlosslang} />
    </td>
  {:else}
    <td
      class={column.class?.(row)}
      onclick={cellEditable ? handleActivate : null}
      in:fade|local={{ duration: 300 }}
    >
      {#if href}
        <a
          {href}
          data-sveltekit-preload-data={column.prefetch ? null : 'off'}
        >{value(row)}</a>
      {:else}
        <span>{value(row)}</span>
      {/if}
    </td>
  {/if}
{/if}
