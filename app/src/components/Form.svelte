<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  const dispatch = createEventDispatcher();
  import { serializeArrayParam, stringify } from '$lib/util';
  import Svelecte from '$lib/svelecte';
  
  export let fields;
  export let values = {};
  export let submitLabel;
  export let action = null;
  export let method = null;
  export let browserSubmit = false;
  export let loading = false;
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
  on:submit={!browserSubmit && handleSubmit}
  {action}
  {method}
  noValidate={!browserSubmit}
  {style}
  class={className}
>
  {#each fields as field (field.name)}
    <div>
      {#if field.static}
        <span class="label">
          {field.label}:
        </span>
        <span>
          {stringify(values[field.name])}
        </span>
      {:else}
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
        {:else if field.type === 'radio'}
          <span>
            {#each field.options as option (option.value)}
              <label class="radiolabel">
                <input
                type="radio"
                name={field.name}
                value={option.value}
                checked={values[field.name] === option.value}
                bind:group={values[field.name]}
                required={field.required}
                >
                <span>{option.label}</span>
              </label>
            {/each}
          </span>
        {:else if field.type === 'textarea'}
          <textarea
            name={field.name}
            bind:value={values[field.name]}
            required={field.required}
          />
        {:else if field.type === 'language'}
          <Svelecte
            options={field.options}
            labelField="name"
            searchField="name"
            valueField="id"
            clearable
            searchable
            placeholder=""
            bind:value={values[field.name]}
          />
          {#if browserSubmit}
            <input type="hidden" name={field.name} value={stringify(values[field.name])}>
          {/if}
        {:else if field.type === 'languages'}
          <Svelecte
            options={field.options}
            labelField="name"
            searchField="name"
            valueField="id"
            multiple
            clearable
            searchable
            placeholder=""
            bind:value={values[field.name]}
          />
          {#if browserSubmit}
            <input type="hidden" name={field.name} value={serializeArrayParam(values[field.name] ?? [])}>
          {/if}
        {/if}
      {/if}
    </div>
  {/each}
  <button type="submit" disabled={loading}>{submitLabel}</button>
  <slot name="hidden" />
</form>

<style lang="scss">
  form {
    border: 1px solid gray;
    padding: 12px;
    width: var(--formwidth, 19em);

    display: flex;
    flex-direction: column;

    > div {
      display: grid;
      grid-template-columns: var(--gridtemplate, 42% 58%);
      align-items: center;
      margin-block: 6px;

      label, .label {
        margin-inline-end: 12px;
        text-align: end;
      }

      .radiolabel {
        margin-inline-end: 12px;
        text-align: start;
        * {
          vertical-align: middle;
        }
      }

      :global(.svelecte-control) {
        :global(.sv-control:not(.is-active)) {
          border: 1px solid gray;
        }
      }
    }

    > button {
      align-self: flex-end;
      margin-block: 9px 3px;
    }
  }
</style>