<script>
  export let name;
  export let label;
  export let checked;
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