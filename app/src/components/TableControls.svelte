<script>
  import Icon from 'svelte-awesome';
  import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons'
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let row;
  export let controls;
  let scale = 0.9;

  const iconMap = {
    delete: faTrash,
    edit: faEdit,
  };

  function handleClick(control) {
    if (control.type !== 'delete' || control.confirm(row)) {
      dispatch(control.type, row);
    }
  }
</script>

<td>
{#each controls as control}
  {#if !control[`can${control.type}`] || control[`can${control.type}`](row)}
    {#if control.link}
      <a href={control.link(row)}>
        <Icon data={iconMap[control.type]} {scale} />
      </a>
    {:else}
      <span on:click={e => handleClick(control)}>
        <Icon data={iconMap[control.type]} {scale} on:click={handleClick} />
      </span>
    {/if}
  {/if}
{/each}
</td>

<style>
  td :global(.fa-icon) {
    vertical-align: middle;
    color: #034f84;
  }

  td :global(.fa-icon):hover {
    color: #92a8d1;
  }
</style>