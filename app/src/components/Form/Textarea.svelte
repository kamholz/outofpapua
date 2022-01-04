<script>
  export let field;
  export let values;
  export let haveTextCheckbox;
  export let browserSubmit;
  const { name, required } = field;
</script>

<textarea
  id={name}
  {name}
  class="field"
  bind:value={values[name]}
  {required}
/>
