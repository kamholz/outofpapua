<script>
  export let field;
  export let values;
  export let haveTextCheckbox;haveTextCheckbox;
  export let browserSubmit;browserSubmit;
  const { name, required } = field;
</script>

<textarea
  id={name}
  {name}
  class="field"
  bind:value={values[name]}
  {required}
/>
