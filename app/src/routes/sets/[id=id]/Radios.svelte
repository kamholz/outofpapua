<script>
  let {
    key,
    values = $bindable(),
    promises,
    options,
    handleUpdate
  } = $props();
</script>

<span class="radios">
  {#each options as [value, label] (value)}
    <label>
      <input
        type="radio"
        {value}
        disabled={promises.pending[key]}
        bind:group={values[key]}
        onchange={() => handleUpdate(key)}
      >
      <span>{label}</span>
    </label>
  {/each}
</span>

<style lang="scss">
  .radios {
    display: flex;
    label {
      margin-inline-end: 16px;
      display: flex;
      align-items: center;
    }
    input {
      margin-inline-end: 4px;
    }
  }
</style>
