<script>
  import TableControlDelete from '$components/TableControl/Delete.svelte';
  import TableControlEdit from '$components/TableControl/Edit.svelte';
  import TableControlSelect from '$components/TableControl/Select.svelte';
  import TableControlSet from '$components/TableControl/Set.svelte';
  import TableControlView from '$components/TableControl/View.svelte';
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
  <div class="controls">
    {#each controls as control (control.type)}
      <svelte:component
        this={componentMap[control.type]}
        {control}
        {row}
        {scale}
        on:click={() => dispatch(control.type, row)}
      />
    {/each}
  </div>
</td>

<style lang="scss">
  .controls {
    display: flex;

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
