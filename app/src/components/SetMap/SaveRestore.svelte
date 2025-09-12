<script>
  import { createEventDispatcher, getContext } from 'svelte';
  const dispatch = createEventDispatcher();
  const preferences = getContext('preferences');

  let { name = $bindable(), getView, setView } = $props();
</script>

<button
  type="button"
  onclick={() => preferences.update({ mapView: getView() })}
>Save Map View</button>
<button
  type="button"
  onclick={() => setView($preferences.mapView)}
  disabled={!$preferences.mapView}
>Restore Saved View</button>

<label>
  Map name:
  <input type="text" bind:value={name}>
</label>
<button
  type="button"
  onclick={() => dispatch('save')}
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
