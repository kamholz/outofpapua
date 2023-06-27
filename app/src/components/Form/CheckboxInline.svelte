<script>
  export let field;
  export let values;
  export let haveCheckbox;haveCheckbox;
  export let browserSubmit;browserSubmit;
  const { disabled, label, name, required } = field;
</script>

<div class="field">
  <input
    type="checkbox"
    id={name}
    {name}
    value="1"
    bind:checked={values[name]}
    {required}
    {disabled}
    on:change
  >
  <label for={name}>
    {label}
  </label>
</div>

<style>
  div {
    display: flex;
  }
  input {
    margin-inline-end: 8px;
  }
</style>