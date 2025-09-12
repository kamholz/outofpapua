<script>
  import Icon from 'svelte-awesome';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { faTrash } from '@fortawesome/free-solid-svg-icons';

  let { control, row, scale } = $props();

  function confirmDelete() {
    if (control.confirm(row)) {
      dispatch('click');
    }
  }
</script>

{#if !control.canDelete || control.canDelete(row)}
  <span title="Delete" onclick={confirmDelete}>
    <Icon data={faTrash} {scale} />
  </span>
{/if}
