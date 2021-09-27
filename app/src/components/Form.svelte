<script>
  import Svelecte from '$components/Svelecte.svelte';
  import { createEventDispatcher, tick } from 'svelte';
  import { formDisplayValue, nullify, serializeArrayParam } from '$lib/util';
  const dispatch = createEventDispatcher();
  import { pageLoading } from '$lib/stores';
  
  export let fields;
  export let values = {};
  export let selections = {};
  export let submitLabel = null;
  export let clearable = false;
  export let help = null;
  export let action = null;
  export let method = null;
  export let browserSubmit = false;
  export let style = null;
  let className = null;
  export { className as class };

  async function handleSubmit(e) {
    if (!browserSubmit) {
      e.preventDefault();
    }
    const form = e.currentTarget;
    const submitValues = {};
    for (const { name, type } of fields.filter((v) => !v.readonly)) { // normalize whitespace
      submitValues[name] = (type === 'text' || type === 'textarea')
        ? nullify(values[name]?.trim())
        : values[name];
    }
    await tick();
    dispatch('beforesubmit', { form, values: submitValues });
    if (form.checkValidity()) {
      if (!browserSubmit) {
        dispatch('submit', { form, values: submitValues });
      }
    } else {
      if (browserSubmit) {
        e.preventDefault();
      }
      form.reportValidity();
    }
  }

  function handleClear() {
    for (const { name, type } of fields.filter((v) => !v.readonly)) {
      if (type === 'text' || type === 'email' || type === 'password' || type === 'textarea') {
        values[name] = null;
      } else if (type === 'suggest') {
        selections[name] = null;
      } else if (type === 'suggestMulti') {
        selections[name] = [];
      }
    }
  }
</script>
  
<form
  on:submit={handleSubmit}
  {action}
  {method}
  novalidate
  {style}
  class={className}
>
  {#each fields as { checkbox, name, label, options, readonly, required, svelecteProps, type } (name)}
    <div>
      {#if readonly}
        <span class="label">
          {label}:
        </span>
        <span>
          {formDisplayValue(values[name], type)}
        </span>
      {:else}
        <label for={name}>{label}:</label>
        <span>
          {#if type === 'text'}
            <input
              type="text"
              id={name}
              {name}
              bind:value={values[name]}
              {required}
            >
            {#if checkbox}
              <label class="checkbox">
                <input
                  type="checkbox"
                  name={checkbox[0]}
                  value="1"
                  bind:checked={values[checkbox[0]]}
                >
                {checkbox[1]}
              </label>
            {/if}
          {:else if type === 'email'}
            <input
              type="email"
              id={name}
              {name}
              bind:value={values[name]}
              {required}
            >
          {:else if type === 'password'}
            <input
              type="password"
              id={name}
              {name}
              bind:value={values[name]}
              {required}
            >
          {:else if type === 'checkbox'}
            <input
              type="checkbox"
              id={name}
              {name}
              value="1"
              bind:checked={values[name]}
              {required}
              on:change
            >
          {:else if type === 'radio'}
            {#each options as { label, value } (value)}
              <label class="radio">
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
          {:else if type === 'textarea'}
            <textarea
              id={name}
              {name}
              bind:value={values[name]}
              {required}
            />
          {:else if type === 'suggest'}
            <Svelecte
              {options}
              props={svelecteProps}
              bind:value={values[name]}
              bind:selection={selections[name]}
              clearable={!required}
            />
            {#if browserSubmit}
              <input
                type="hidden"
                {name}
                value={values[name]}
                disabled={values[name] === null}
              >
            {/if}
          {:else if type === 'suggestMulti'}
            <Svelecte
              {options}
              multiple
              props={svelecteProps}
              bind:value={values[name]}
              bind:selection={selections[name]}
              clearable={!required}
            />
            {#if browserSubmit}
              <input
                type="hidden"
                {name}
                value={serializeArrayParam(values[name] ?? [])}
                disabled={!values[name]?.length}
              >
            {/if}
          {/if}
        </span>
      {/if}
    </div>
  {/each}
  {#if submitLabel || help}
    <div class="controls">
      <div class="buttons">
        {#if submitLabel}
          <button type="submit" disabled={$pageLoading}>{submitLabel}</button>
        {/if}
        {#if clearable}
          <button type="button" disabled={$pageLoading} on:click={handleClear}>Clear</button>
        {/if}
        <slot name="buttons" />
      </div>
      {#if help}
        <svelte:component this={help} />
      {/if}
    </div>
  {/if}
  <slot name="hidden" />
</form>

<style lang="scss">
  form {
    border: 1px solid gray;
    padding: 12px;
    width: var(--form-width, 19em);

    display: flex;
    flex-direction: column;

    > div {
      display: grid;
      grid-template-columns: var(--grid-template, 42% 58%);
      align-items: center;
      margin-block: 6px;

      > span {
        display: flex;
        align-items: center;
      }

      input[type="text"] {
        flex-grow: 10;
      }

      textarea {
        flex-basis: 100%;
      }

      label, .label {
        margin-inline-end: 12px;
        text-align: end;
      }

      label.checkbox {
        margin: 0;
      }

      label.radio {
        text-align: start;
        * {
          vertical-align: middle;
        }
      }
    }

    > .controls {
      display: flex;
      flex-direction: row-reverse;
      justify-content: space-between;
      margin-block: 9px 3px;

      > .buttons {
        display: flex;
        flex-direction: row-reverse;
      }
    }
  }
</style>
