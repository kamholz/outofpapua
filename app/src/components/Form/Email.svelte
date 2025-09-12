<script>
  let {
    field,
    values = $bindable(),
    haveCheckbox,
    browserSubmit
  } = $props();
  const { name, required } = field;
</script>

<input
  type="email"
  id={name}
  {name}
  class="field"
  class:narrow={haveCheckbox}
  bind:value={values[name]}
  {required}
>
{#if haveCheckbox}
  <span></span>
{/if}
