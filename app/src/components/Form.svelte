<script>
	import { createEventDispatcher, tick } from 'svelte';
  const dispatch = createEventDispatcher();
  import { serializeArrayParam } from '$lib/util';
  import Svelecte from '$lib/svelecte';
  
  export let action = null;
  export let method = null;
  export let preventDefault = true;
  export let loading = false;
  export let fields;
  export let values = {};
  export let submitLabel;
  export let style = null;
  let className = null;
  export { className as class };

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    for (const field of fields) { // normalize whitespace
      if (field.type === 'text') {
        values[field.name] = values[field.name]?.trim();
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
  class={className}
>
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
      {:else if field.type === 'languages'}
        <Svelecte
          options={field.options}
          labelField="name"
          valueField="id"
          multiple
          clearable
          searchable
          placeholder=""
          bind:value={values[field.name]}
        />
        <input type="hidden" name={field.name} value={serializeArrayParam(values[field.name] ?? [])}>
      {/if}
    </div>
  {/each}
  <button type="submit" disabled={loading}>{submitLabel}</button>
  <slot name="hidden" />
</form>

<style lang="scss">
  form {
    border: 1px solid gray;
    padding: 10px;
    width: var(--formwidth, 18em);

    display: flex;
    flex-direction: column;

    > div {
      display: grid;
      grid-template-columns: var(--gridtemplate, 43% 57%);
      align-items: center;
      margin-block: 6px;

      label {
        margin-inline-end: 10px;
        text-align: end;
      }

      input[type="checkbox"] {
        margin: 0;
      }

      :global(.svelecte-control) {
        :global(.sv-control) {
          border: 1px solid gray;
        }

        :global(.highlight) {
          background-color: unset;
          font-weight: bold;
        }
      }
    }

    > button {
      align-self: flex-end;
      margin-block: 6px;
    }
  }
</style>