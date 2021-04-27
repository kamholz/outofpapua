<script>
	import { createEventDispatcher, tick } from 'svelte';
  const dispatch = createEventDispatcher();
  import { serializeArrayParam } from '$lib/util';
  import Select from 'svelte-select';
  
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
      } else if (field.type === 'glosslang') {
        values[field.name] = values[field.name].map(v => v.id);
        console.log(values[field.name]);
        throw 'blah';
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

  function serializeMultiselectValue(value, key) {
    return value
      ? serializeArrayParam(value.map(v => v[key]))
      : "";
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
      {:else if field.type === 'glosslang'}
        <Select
          items={field.options}
          isMulti
          isSearchable={false}
          hideEmptyState
          optionIdentifier="id"
          placeholder=""
          getOptionLabel={option => option.name}
          getSelectionLabel={option => option?.name}
          bind:selectedValue={values[field.name]}
        />
        <input type="hidden" name={field.name} value={serializeMultiselectValue(values[field.name], 'id')}>
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
    }

    > button {
      align-self: flex-end;
      margin-block: 6px;
    }

    // svelte-select
    --border: 1px solid gray;
    --borderRadius: 2px;
    --height: 30px;
    --multiSelectPadding: 0 30px 0 6px;

    --multiItemHeight: 22px;
    --multiItemMargin: 4px 3px 0 0;
    --multiItemPadding: 0 10px 0 10px;
    --multiLabelMargin: 0 4px 0 0;
    --multiClearTop: 2px;

    --clearSelectRight: 6px;
    --clearSelectTop: 6px;
    --clearSelectBottom: 6px;
    --clearSelectWidth: 18px;

    --indicatorRight: 6px;
    --indicatorTop: 6px;
    --indicatorWidth: 20px;
    --indicatorHeight: 20px;

    :global(.multiSelectItem_label) {
      font-size: 13px;
    }
  }
</style>