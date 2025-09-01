<script>
  export let field;
  export let values;
  export let haveCheckbox;
  export let browserSubmit;browserSubmit;
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
