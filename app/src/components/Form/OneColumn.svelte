<script>
  export let fields;
  export let values;
</script>

{#each fields as field (field.name)}
<div>
  <label for={field.name}>{field.label}:</label>
  {#if field.type === 'text'}
    <input 
      type="text"
      name={field.name} 
      bind:value={values[field.name]}
      required={field.required}
    >
  {:else if field.type === 'email'}
    <input 
      type="email"
      name={field.name} 
      bind:value={values[field.name]}
      required={field.required}
    >
  {:else if field.type === 'password'}
    <input 
      type="password" 
      name={field.name} 
      bind:value={values[field.name]}
      required={field.required}
    >
  {:else if field.type === 'checkbox'}
    <input 
      type="checkbox" 
      name={field.name} 
      bind:checked={values[field.name]}
      required={field.required}
    >
  {/if}
</div>
{/each}

<style lang="scss">
  div {
    display: grid;
    grid-template-columns: 43% 57%;
    align-items: center;
    margin-block: 6px;

    label {
      margin-inline-end: 10px;
      text-align: end;
    }

    input[type="checkbox"] {
      margin: 0;
    }
  }
</style>