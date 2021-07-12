<script>
  import Senses from '$components/Senses.svelte';
  import TableCellAutocomplete from '$components/TableCell/Autocomplete.svelte';
  import TableCellCheckbox from '$components/TableCell/Checkbox.svelte';
  import TableCellInput from '$components/TableCell/Input.svelte';
  import { fade } from 'svelte/transition';

  export let row;
  export let column;
  export let editable;
  export let editingCell;

  const { type, value } = column;
  const cellEditable = editable &&
    (typeof(column.editable) === 'function' ? column.editable(row) : column.editable);
  const href = !cellEditable && column.link && column.link(row);

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
    <td on:click={cellEditable ? handleActivate : null}>
      <Senses senses={value(row)} multilang={column.multilang} />
    </td>
  {:else}
    <td
      class={column.class?.(row)}
      on:click={cellEditable ? handleActivate : null}
      in:fade|local={{ duration: 300 }}
    >
      {#if href}
        <a
          {href}
          sveltekit:prefetch={column.prefetch ?? null}
        >{value(row)}</a>
      {:else}
        <span>{value(row)}</span>
      {/if}
    </td>
  {/if}
{/if}
