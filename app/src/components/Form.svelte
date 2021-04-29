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
      if (type === 'text') {
        values[name] = values[name]?.trim();
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
  {#each fields as { name, label, options, required, type, uneditable } (name)}
    <div>
      {#if uneditable}
        <span class="label">
          {label}:
        </span>
        <span>
          {stringify(values[name])}
        </span>
      {:else}
        <label for={name}>{label}:</label>
        {#if type === 'text'}
          <input
            type="text"
            {name}
            bind:value={values[name]}
            {required}
          >
        {:else if type === 'email'}
          <input
            type="email"
            {name}
            bind:value={values[name]}
            {required}
          >
        {:else if type === 'password'}
          <input
            type="password"
            {name}
            bind:value={values[name]}
            {required}
          >
        {:else if type === 'checkbox'}
          <input
            type="checkbox"
            {name}
            bind:checked={values[name]}
            {required}
          >
        {:else if type === 'radio'}
          <span>
            {#each options as { label, value } (value)}
              <label class="radiolabel">
                <input
                  type="radio"
                  {name}
                  {value}
                  checked={values[name] === value}
                  bind:group={values[name]}
                  {required}
                >
                <span>{label}</span>
              </label>
            {/each}
          </span>
        {:else if type === 'textarea'}
          <textarea
            {name}
            bind:value={values[name]}
            {required}
          />
        {:else if type === 'language'}
          <Svelecte
            {options}
            labelField="name"
            searchField="name"
            valueField="id"
            clearable
            searchable
            placeholder=""
            bind:value={values[name]}
          />
          {#if browserSubmit}
            <input type="hidden" {name} value={stringify(values[name])}>
          {/if}
        {:else if type === 'languages'}
          <Svelecte
            {options}
            labelField="name"
            searchField="name"
            valueField="id"
            multiple
            clearable
            searchable
            placeholder=""
            bind:value={values[name]}
          />
          {#if browserSubmit}
            <input type="hidden" {name} value={serializeArrayParam(values[name] ?? [])}>
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