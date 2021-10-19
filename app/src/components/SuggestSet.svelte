<script>
  import Svelecte from '$lib/svelecte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import * as suggest from '$actions/suggest';

  export let entry_id = null;
  export let set_id = null;
  let selection = null;

  function handleSelect() {
    if (selection) {
      dispatch('select', selection);
      selection = null;
    }
  }
</script>

<Svelecte
  fetch={(search) => suggest.set({ entry_id, search, set_id })}
  labelField="name"
  searchField="name"
  valueField="id"
  clearable
  searchable
  placeholder=""
  bind:selection
  on:change={handleSelect}
/>
