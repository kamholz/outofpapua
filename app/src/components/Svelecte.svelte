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
