<script>
  let { name, label, checked = $bindable() } = $props();
</script>

<label>
  <input
    type="checkbox"
    {name}
    value="1"
    bind:checked
  >
  {label}
</label>

<style>
  label {
    margin-inline: 14px 0;
  }
</style>
