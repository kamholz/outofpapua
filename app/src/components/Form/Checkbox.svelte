<script>
  export let field;
  export let values;
  export let haveCheckbox;haveCheckbox;
  export let browserSubmit;browserSubmit;
  const { disabled, name, required } = field;
</script>

<input
  type="checkbox"
  id={name}
  {name}
  value="1"
  class="field"
  bind:checked={values[name]}
  {required}
  {disabled}
  on:change
>