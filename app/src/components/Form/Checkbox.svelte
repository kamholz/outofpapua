<script>
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
  let {
    field,
    values = $bindable(),
    haveCheckbox,
    browserSubmit
  } = $props();
  const { disabled, name, required } = field;
</script>

<input
  type="checkbox"
  id={name}
  {name}
  value="1"
  class="field"
  bind:checked={values[name]}
  {required}
  {disabled}
  onchange={bubble('change')}
>
