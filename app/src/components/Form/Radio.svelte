<script>
  export let field;
  export let values;
  export let haveCheckbox;haveCheckbox;
  export let browserSubmit;browserSubmit;
  const { name, options, required } = field;
</script>

<span class="field">
  {#each options as { label, value } (value)}
    <label class="radio">
      <input
        type="radio"
        {name}
        {value}
        bind:group={values[name]}
        {required}
        on:change
      >
      <span>{label}</span>
    </label>
  {/each}
</span>

<style lang="scss">
  label {
    margin-inline-end: 12px;
    text-align: start;
    * {
      vertical-align: middle;
    }  
  }
</style>