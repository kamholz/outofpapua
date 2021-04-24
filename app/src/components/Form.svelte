<script>
	import { createEventDispatcher, tick } from 'svelte';
  const dispatch = createEventDispatcher();
  
  export let action = null;
  export let method = null;
  export let preventDefault = true;
  export let loading = false;
  export let fields;
  export let values = {};
  export let submitLabel;
  export let style = null;

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    for (const field of fields) { // normalize whitespace
      if (field.type === 'text') {
        values[field.name] = values[field.name].trim();
      }
    }
    await tick();
    dispatch('beforesubmit', { form, values });
    if (form.checkValidity()) {
      dispatch('submit', { form, values });
    } else {
      form.reportValidity();
    }
  }
</script>
  
<form 
  on:submit={preventDefault && handleSubmit}
  noValidate={preventDefault}
  {action}
  {method}
  {style}
>

  {#each fields as field}
    <div>
      {#if field.type === 'text'}
        <label for={field.name}>{field.label}:</label>
        <input 
          type="text"
          name={field.name} 
          bind:value={values[field.name]}
          required={field.required}
        >
      {:else if field.type === 'email'}
        <label for={field.name}>{field.label}:</label>
        <input 
          type="email"
          name={field.name} 
          bind:value={values[field.name]}
          required={field.required}
        >
      {:else if field.type === 'password'}
        <label for={field.name}>{field.label}:</label>
        <input 
          type="password" 
          name={field.name} 
          bind:value={values[field.name]}
          required={field.required}
        >
      {:else if field.type === 'checkbox'}
        <label for={field.name}>{field.label}:</label>
        <input 
          type="checkbox" 
          name={field.name} 
          bind:checked={values[field.name]}
          required={field.required}
        >
      {/if}
    </div>
  {/each}
  <button type="submit" disabled={loading}>{submitLabel}</button>
</form>

<style lang="scss">
  form {
    border: 1px solid gray;
    padding: 10px;
    width: 18em;

    display: flex;
    flex-direction: column;

    > div {
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

    > button {
      align-self: flex-end;
      margin-block: 6px;
    }
  }
</style>