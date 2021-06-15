<script>
  import Senses from '$components/Senses.svelte';
  import TableCellAutocomplete from '$components/TableCell/Autocomplete.svelte';
  import TableCellCheckbox from '$components/TableCell/Checkbox.svelte';
  import TableCellInput from '$components/TableCell/Input.svelte';
  import { fade } from 'svelte/transition';

  export let row;
  export let column;
  export let editable;
  export let active = false;

  const { type, value } = column;
  const cellEditable = editable &&
    (typeof(column.editable) === 'function' ? column.editable(row) : column.editable);
  const href = !cellEditable && column.link && column.link(row);

  function handleActivate() {
    active = true;
  }

  function handleDeactivate() {
    active = false;
  }
</script>

{#if type === 'checkbox'}
  <TableCellCheckbox
    {row}
    {column}
    on:update
  />
{:else if active}
  {#if type === 'autocomplete'}
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
  {#if type === 'senses'}
    <td on:click={cellEditable ? handleActivate : null}>
      <Senses senses={value(row)} multilang={column.multilang} />
    </td>
  {:else}
    <td
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
