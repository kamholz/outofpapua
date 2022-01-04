<script>
  export let field;
  export let values;
  export let haveTextCheckbox;
  export let browserSubmit;browserSubmit;
  const { name, required } = field;
</script>

<input
  type="password"
  id={name}
  {name}
  class="field"
  class:narrow={haveTextCheckbox}
  bind:value={values[name]}
  {required}
>
{#if haveTextCheckbox}
  <span></span>
{/if}