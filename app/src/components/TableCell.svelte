<script>
  import TableCellAutocomplete from '$components/TableCell/Autocomplete.svelte';
  import TableCellCheckbox from '$components/TableCell/Checkbox.svelte';
  import TableCellInput from '$components/TableCell/Input.svelte';
  import { fade } from 'svelte/transition';

  export let row;
  export let column;
  export let editable;
  export let active = false;

  const { link, type, value } = column;
  const cellEditable = editable &&
    (typeof(column.editable) === 'function' ? column.editable(row) : column.editable);

  function handleActivate() {
    active = true;
  }

  function handleDeactivate() {
    active = false;
  }
</script>

{#if cellEditable}
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
    <td
      on:click={handleActivate}
      in:fade|local={{ duration: 300 }}
    >
      <span>{value(row)}</span>
    </td>
  {/if}
{:else}
  <td>
    {#if link}
      <a href={link(row)} sveltekit:prefetch>{value(row)}</a>
    {:else}
      <span>{value(row)}</span>
    {/if}
  </td>
{/if}
