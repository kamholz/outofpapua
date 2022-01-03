<script>
  import { getContext } from 'svelte';
  const preferences = getContext('preferences');

  export let baseMap;
</script>

<label>
  Base map:
  <select
    bind:value={baseMap}
    on:change={() => preferences.update({ baseMap })}
  >
    <option value="esri-gray-canvas">Gray Canvas</option>
    <option value="cartodb-positron">Positron</option>
    <option value="esri-shaded-relief">Shaded Relief</option>
  </select>
</label>

<style lang="scss">
  label {
    margin-block-end: 6px;
  }
</style>