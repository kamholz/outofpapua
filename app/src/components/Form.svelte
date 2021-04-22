<script>
  export let fields;
  export let values = {};
</script>
  
<form on:submit>
  {#each fields as field}
    <div>
      {#if field.type === 'text'}
        <label for={field.name}>{field.label}:</label><input type="text" name={field.name} bind:value={values[field.name]}>
      {:else if field.type === 'password'}
        <label for={field.name}>{field.label}:</label><input type="password" name={field.name} bind:value={values[field.name]}>
      {:else if field.type === 'checkbox'}
        <label for={field.name}>{field.label}:</label><input type="checkbox" name={field.name} bind:value={values[field.name]}>
      {:else if field.type === 'submit'}
        <button type="submit">{field.label}</button>
      {/if}
    </div>
  {/each}
</form>

<style lang="scss">
  form {
    border: 1px solid gray;
    padding: 10px;
    width: fit-content;

    display: flex;
    flex-direction: column;

    & > div {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-block: 6px;
    }
  }

  label {
    margin-inline-end: 10px;
    width: 6em;
    text-align: right;
  }

  input {
    width: 12em;
  }
</style>