<!-- @migration-task Error while migrating Svelte code: migrating this component would require adding a `$props` rune but there's already a variable named props.
     Rename the variable and try again or migrate by hand. -->
<script>
  import Svelecte from '$lib/svelecte';

  export let name = null;
  export let options;
  export let value = null;
  export let multiple = false;
  export let disabled = false;
  export let clearable = true;
  export let props = null;
</script>

<Svelecte
  {name}
  {options}
  {multiple}
  {disabled}
  labelField="name"
  searchField="name"
  valueField="id"
  {clearable}
  searchable
  placeholder=""
  {...props}
  bind:value
  on:change
/>
