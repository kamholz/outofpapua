<script>
  import Svelecte from '$lib/svelecte';

  export let options;
  export let value = null;
  export let multiple = false;
  export let disabled = false;
  export let clearable = true;
</script>

<Svelecte
  {options}
  {multiple}
  {disabled}
  labelField="name"
  searchField="name"
  valueField="id"
  {clearable}
  searchable
  placeholder=""
  bind:value
  on:change
/>
