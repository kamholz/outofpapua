<script>
  import Svelecte from '$lib/svelecte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import * as suggest from '$actions/suggest';

  /**
   * @typedef {Object} Props
   * @property {any} [entry_id]
   * @property {any} [set_id]
   * @property {boolean} [exclude_grouped]
   */

  /** @type {Props} */
  let { entry_id = null, set_id = null, exclude_grouped = false } = $props();
  let selection = $state(null);
  let value = $state(null);

  function handleSelect() {
    if (selection) {
      dispatch('select', selection);
      value = null;
    }
  }
</script>

<Svelecte
  fetch={(search) => suggest.set({ entry_id, exclude_grouped, search, set_id })}
  labelField="name"
  searchField="name"
  valueField="id"
  clearable
  searchable
  placeholder=""
  disableSifter
  bind:value
  bind:readSelection={selection}
  on:change={handleSelect}
/>
