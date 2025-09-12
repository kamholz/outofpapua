<script>
  let {
    field,
    values = $bindable(),
    haveCheckbox,
    browserSubmit
  } = $props();
  const { name, required } = field;
</script>

<textarea
  id={name}
  {name}
  class="field"
  bind:value={values[name]}
  {required}
></textarea>
