<script>
  import { booleanTernary } from '$lib/util';
  import { getContext } from 'svelte';
  const editable = getContext('editable');

  export let name;
  export let label;
  export let value;
</script>

<li>
  <span class="memberlabel">{label}:</span>
  <span>
    {#if editable}
      <label>
        <input type="radio" {name} value={true} bind:group={value} on:click>
        yes
      </label>
      <label>
        <input type="radio" {name} value={false} bind:group={value} on:click>
        no
      </label>
      <label>
        <input type="radio" {name} value={null} bind:group={value} on:click>
        unknown
      </label>
    {:else}
      {booleanTernary(value)}
    {/if}
  </span>
</li>

<style>
  label, input {
    vertical-align: middle;
  }
  label {
    margin-inline-end: 8px; 
  }
  input {
    margin-inline-start: 4px;
  }
</style>
