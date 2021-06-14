<script>
  import keydown from '$lib/keydown';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let value;
</script>

<span
  contenteditable="true"
  bind:textContent={value}
  use:keydown={{ enter: () => dispatch('submit'), esc: () => dispatch('cancel') }}
/>

<style lang="scss">
  @include contenteditable;
</style>