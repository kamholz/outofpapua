<script>
  export let field;
  export let values;
  export let haveTextCheckbox;
  export let browserSubmit;
  const { name, required } = field;
</script>

<input
  type="checkbox"
  id={name}
  {name}
  value="1"
  class="field"
  bind:checked={values[name]}
  {required}
  on:change
>