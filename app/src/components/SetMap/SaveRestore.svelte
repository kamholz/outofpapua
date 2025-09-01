<script>
  import { createEventDispatcher, getContext } from 'svelte';
  const dispatch = createEventDispatcher();
  const preferences = getContext('preferences');

  export let name;
  export let getView;
  export let setView;
</script>

<button
  type="button"
  on:click={() => preferences.update({ mapView: getView() })}
>Save Map View</button>
<button
  type="button"
  on:click={() => setView($preferences.mapView)}
  disabled={!$preferences.mapView}
>Restore Saved View</button>

<label>
  Map name:
  <input type="text" bind:value={name}>
</label>
<button
  type="button"
  on:click={() => dispatch('save')}
  disabled={!name?.length}
>Save</button>

<style lang="scss">
  label {
    margin-block-end: 6px;
  }

  button {
    align-self: flex-start;
    margin-block: 6px;
  }
</style>
