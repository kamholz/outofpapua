<script>
  import CheckboxSide from '$components/Form/CheckboxSide.svelte';

  let {
    field,
    values = $bindable(),
    haveCheckbox,
    browserSubmit
  } = $props();
  const { checkbox, name, required } = field;
</script>

<input
  type="text"
  id={name}
  {name}
  class="field"
  class:narrow={haveCheckbox}
  bind:value={values[name]}
  {required}
>
{#if checkbox}
  <CheckboxSide
    name={checkbox[0]}
    bind:checked={values[checkbox[0]]}
    label={checkbox[1]}
  />
{:else if haveCheckbox}
  <span></span>
{/if}
