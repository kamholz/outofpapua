<script>
  import Svelecte from '$components/Svelecte.svelte';
  import { serializeArrayParam } from '$lib/util';
  import { slide } from 'svelte/transition';

  export let field;
  export let values;
  export let haveTextCheckbox;
  export let browserSubmit;
  const { name, options, required, svelecteProps } = field;
</script>

<div class="field" transition:slide={{ duration: 200 }}>
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
