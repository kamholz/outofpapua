<script>
  export let row;
  export let column;

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
    on:click={handleCheckbox}
  >
</td>