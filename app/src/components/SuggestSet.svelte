<script>
  import Svelecte from '$lib/svelecte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import * as suggest from '$actions/suggest';

  export let entry_id = null;
  export let set_id = null;
  export let exclude_grouped = false;
  let selection = null;
  let value = null;

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
