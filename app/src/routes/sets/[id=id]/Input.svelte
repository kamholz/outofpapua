<script>
  import keydown from '$lib/keydown';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  /**
   * @typedef {Object} Props
   * @property {any} value
   * @property {any} [autofocus]
   */

  /** @type {Props} */
  let { value = $bindable(), autofocus = null } = $props();
</script>

<span
  contenteditable="true"
  {autofocus}
  bind:textContent={value}
  use:keydown={{ enter: () => dispatch('submit'), esc: () => dispatch('cancel') }}
></span>

<style lang="scss">
  @include contenteditable;
</style>
