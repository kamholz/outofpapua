<script>
  import Icon from 'svelte-awesome';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { faTrash } from '@fortawesome/free-solid-svg-icons';

  export let control;
  export let row;
  export let scale;

  function confirmDelete() {
    if (control.confirm(row)) {
      dispatch('click');
    }
  }
</script>

{#if !control.canDelete || control.canDelete(row)}
  <span on:click={confirmDelete}>
    <Icon data={faTrash} {scale} label="Delete" />
  </span>
{/if}