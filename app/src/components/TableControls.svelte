<script>
  import Icon from 'svelte-awesome';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { faBezierCurve, faEdit, faInfoCircle, faTrash } from '@fortawesome/free-solid-svg-icons';

  export let row;
  export let controls;
  const scale = 0.9;

  const iconMap = {
    delete: faTrash,
    edit: faEdit,
    set: faBezierCurve,
    view: faInfoCircle,
  };

  for (const control of controls) {
    const has = `has_${control.type}`;
    if (!(has in control)) {
      control[has] = () => true;
    }
  }

  function handleClick(control) {
    if (control.type !== 'delete' || control.confirm(row)) {
      dispatch(control.type, row);
    }
  }
</script>

<td>
{#each controls as control (control.type)}
  {#if control[`has_${control.type}`](row)}
    {#if control.link}
      <a href={control.link(row)}>
        <Icon data={iconMap[control.type]} {scale} />
      </a>
    {:else}
      <span on:click={() => handleClick(control)}>
        <Icon data={iconMap[control.type]} {scale} on:click={handleClick} />
      </span>
    {/if}
  {/if}
{/each}
</td>

<style lang="scss">
  td {
    a {
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
