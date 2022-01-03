<script>
  import { getContext } from 'svelte';
  const preferences = getContext('preferences');

  export let baseMap;
  export let lineLength;
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
    <!-- <option value="esri-topo">Topo</option> -->
  </select>
</label>
<label>
  Line length:
  <input
    type="range"
    min="1"
    max="5"
    bind:value={lineLength}
  >
</label>

<style lang="scss">
  label {
    margin-block-end: 6px;
  }
</style>