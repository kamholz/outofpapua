<script>
  import CheckboxSide from '$components/Form/CheckboxSide.svelte';
  import Svelecte from '$components/Svelecte.svelte';
  import { serializeArrayParam } from '$lib/util';
  import { slide } from 'svelte/transition';

  export let field;
  export let values;
  export let haveTextCheckbox;haveTextCheckbox;
  export let browserSubmit;
  const { checkbox, name, options, required, svelecteProps } = field;
</script>

<div
  class="field"
  class:narrow={checkbox}
  transition:slide={{ duration: 200 }}
>
  <Svelecte
    {options}
    multiple
    props={svelecteProps}
    bind:value={values[name]}
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
</div>
{#if checkbox}
  <CheckboxSide
    name={checkbox[0]}
    bind:checked={values[checkbox[0]]}
    label={checkbox[1]}
  />
{/if}
