<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<div>
  <button on:click={() => dispatch('clear')}>Clear Selected</button>
  <button on:click={() => dispatch('link')}>Link Selected</button>
</div>