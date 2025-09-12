<script>
  import { getContext } from 'svelte';
  const preferences = getContext('preferences');

  let { baseMap = $bindable(), showLanguageNames = $bindable() } = $props();
</script>

<label>
  Base map:
  <select
    bind:value={baseMap}
    onchange={() => preferences.update({ baseMap })}
  >
    <option value="esri-gray-canvas">Gray Canvas</option>
    <option value="cartodb-positron">Positron</option>
    <option value="esri-shaded-relief">Shaded Relief</option>
  </select>
</label>
<label>
  <input type="checkbox" bind:checked={showLanguageNames} />&nbsp;Show language names
</label>

<style lang="scss">
  label {
    margin-block-end: 6px;
  }
</style>
