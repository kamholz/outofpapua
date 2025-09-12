<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  let { row = $bindable(), column } = $props();

  function handleCheckbox(e) {
    const value = e.currentTarget.checked;
    dispatch('update', {
      id: row.id,
      values: { [column.key]: value },
      onSuccess: () => {
        row[column.key] = value;
      },
    });
  }
</script>

<td>
  <input
    type="checkbox"
    checked={row[column.key]}
    onclick={handleCheckbox}
  >
</td>
