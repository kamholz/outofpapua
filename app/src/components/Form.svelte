<script>
	import { createEventDispatcher, tick } from 'svelte';
  const dispatch = createEventDispatcher();
  import FormOneColumn from '$components/Form/OneColumn.svelte';
  
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
  <slot name="fields">
    <FormOneColumn {fields} {values} />
  </slot>
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

    > button {
      align-self: flex-end;
      margin-block: 6px;
    }
  }
</style>