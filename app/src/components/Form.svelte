<script>
  import Checkbox from '$components/Form/Checkbox.svelte';
  import Email from '$components/Form/Email.svelte';
  import Password from '$components/Form/Password.svelte';
  import Radio from '$components/Form/Radio.svelte';
  import Suggest from '$components/Form/Suggest.svelte';
  import SuggestMulti from '$components/Form/SuggestMulti.svelte';
  import Text from '$components/Form/Text.svelte';
  import Textarea from '$components/Form/Textarea.svelte';
  import { createEventDispatcher, tick } from 'svelte';
  const dispatch = createEventDispatcher();
  import { formDisplayValue, nullify } from '$lib/util';
  import { pageLoading } from '$lib/stores';
  import { slide } from 'svelte/transition';
  
  export let fields;
  export let values = {};
  export let submitLabel = null;
  export let clearable = false;
  export let help = null;
  export let action = null;
  export let method = null;
  export let browserSubmit = false;
  export let style = null;
  let className = null;
  export { className as class };
  export let form;
  $: haveTextCheckbox = fields.some(({ checkbox, type }) => type === 'text' && checkbox);
  $: haveHotKeys = fields.some(({ hotkey }) => hotkey);
  $: hotKeys = haveHotKeys && Object.fromEntries(fields.map(({ hotkey, name }) => [hotkey, name]));

  const fieldComponent = {
    checkbox: Checkbox,
    email: Email,
    password: Password,
    radio: Radio,
    suggest: Suggest,
    suggestMulti: SuggestMulti,
    text: Text,
    textarea: Textarea,
  };

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
    for (const { checkbox, name } of fields.filter(({ readonly, type }) => !readonly && type !== 'radio')) {
      values[name] = null;
      if (checkbox) {
        values[checkbox[0]] = null;
      }
    }
  }

  function handleKeyDown(e) {
    const { altKey, ctrlKey, key, metaKey, shiftKey } = e;
    if (hotKeys[key] && altKey === false && ctrlKey === true && metaKey === false && shiftKey === false) {
      const formElement = form.elements[hotKeys[key]];
      if (formElement) {
        formElement.focus();
        formElement?.select();
        e.preventDefault();
      }
    }
  }
</script>

<form
  {action}
  {method}
  novalidate
  {style}
  class={className}
  bind:this={form}
  on:submit={handleSubmit}
>
  <div class="fields">
    {#each fields as field (field.name)}
      {#if !field.hide}
        {#if field.readonly}
          <span class="label">
            {@html field.label}:
          </span>
          <span class="field">
            {formDisplayValue(values[field.name], field.type)}
          </span>
        {:else}
          <label for={field.name} class="label" transition:slide={{ duration: 200 }}>
            {@html field.label}:
          </label>
          <svelte:component
            this={fieldComponent[field.type]}
            {field}
            {browserSubmit}
            {haveTextCheckbox}
            bind:values
            on:change
          />
        {/if}
      {/if}
    {/each}
  </div>
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

<svelte:window on:keydown={haveHotKeys && handleKeyDown} />

<style lang="scss">
  form {
    border: 1px solid gray;
    padding: 12px;
    width: var(--form-width, 19em);

    display: flex;
    flex-direction: column;

    > .fields {
      display: grid;
      grid-template-columns: var(--label-width, 42%) 1fr var(--checkbox-width, 5em);
      align-items: center;
      margin-block: 6px;
      row-gap: 12px;

      .label {
        text-align: end;
      }

      :global {
        .field {
          margin-inline-start: 12px;
          grid-column: 2 / 4;
          &.narrow {
            grid-column: 2;
          }
          &[type="checkbox"] {
            justify-self: start;
          }
        }      
      }
    }

    > .controls {
      display: flex;
      flex-direction: row-reverse;
      align-items: center;
      justify-content: space-between;
      margin-block: 9px 3px;

      > .buttons {
        display: flex;
        flex-direction: row-reverse;
      }
    }
  }
</style>
