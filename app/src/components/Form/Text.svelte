<script>
  export let field;
  export let values;
  export let haveTextCheckbox;
  export let browserSubmit;browserSubmit;
  const { checkbox, name, required } = field;
</script>

<input
  type="text"
  id={name}
  {name}
  class="field"
  class:narrow={haveTextCheckbox}
  bind:value={values[name]}
  {required}
>
{#if checkbox}
  <label>
    <input
      type="checkbox"
      name={checkbox[0]}
      value="1"
      bind:checked={values[checkbox[0]]}
    >
    {checkbox[1]}
  </label>
{:else if haveTextCheckbox}
  <span></span>
{/if}

<style>
  label {
    margin-inline: 12px 0;
  }
</style>