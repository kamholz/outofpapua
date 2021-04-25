<script>
  import Icon from 'svelte-awesome';
  import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons'
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let row;
  export let controls;
  const scale = 0.9;

  const iconMap = {
    delete: faTrash,
    edit: faEdit,
  };

  for (const control of controls) {
    const can = `can${control.type}`;
    if (!(can in control)) {
      control[can] = () => true;
    }
  }

  function handleClick(control) {
    if (control.type !== 'delete' || control.confirm(row)) {
      dispatch(control.type, row);
    }
  }
</script>

<td>
{#each controls as control}
  {#if control[`can${control.type}`](row)}
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