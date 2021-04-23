<script>
  import Icon from 'svelte-awesome';
  import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons'
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let row;
  export let controls;

  const iconMap = {
    delete: faTrash,
    edit: faEdit,
  };

  function handleClick(control) {
    if (control.type !== 'delete' || confirm(`Are you sure you want to delete "${row[control.key]}"?`)) {
      dispatch(control.type, row);
    }
  }
</script>

<td>
{#each controls as control}
  {#if !control[`can${control.type}`] || control[`can${control.type}`](row)}
    <span on:click={e => handleClick(control)}>
      <Icon data={iconMap[control.type]} scale="0.9" on:click={handleClick} />
    </span>
  {/if}
{/each}
</td>

<style>
  td :global(.fa-icon) {
    vertical-align: middle;
    color: #777;
  }

  td :global(.fa-icon):hover {
    color: black;
  }
</style>