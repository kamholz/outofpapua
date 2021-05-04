<script>
  import TableControlDelete from '$components/TableControls/Delete.svelte';
  import TableControlEdit from '$components/TableControls/Edit.svelte';
  import TableControlSelect from '$components/TableControls/Select.svelte';
  import TableControlSet from '$components/TableControls/Set.svelte';
  import TableControlView from '$components/TableControls/View.svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let row;
  export let controls;
  const scale = 0.9;

  const componentMap = {
    delete: TableControlDelete,
    edit: TableControlEdit,
    select: TableControlSelect,
    set: TableControlSet,
    view: TableControlView,
  };
</script>

<td>
{#each controls as control (control.type)}
  <svelte:component
    this={componentMap[control.type]}
    {control}
    {row}
    {scale}
    on:click={() => dispatch(control.type, row)}
  />
{/each}
</td>

<style lang="scss">
  td {
    :global(a) {
      text-decoration: none;
    }

    :global(.fa-icon) {
      color: #034f84;
      &:hover {
        color: #92a8d1;
      }
    }
  }
</style>
