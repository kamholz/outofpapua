<script>
  import { getContext } from 'svelte';
  const preferences = getContext('preferences');

  export let { baseMap } = $preferences;
  export let markerType;
  export let lineLength;
  export let showLanguage;
  export let showGloss;
  export let headwordDisplay;

  export let sets;
  export let getView;
  export let updateView;
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
  Marker:
  <select bind:value={markerType}>
    <option value="label">Label</option>
    <option value="point">Point</option>
    <option value="point-label">Point with label</option>
  </select>
</label>
<label>
  Line length:
  <input
    type="range"
    min="1"
    max="5"
    disabled={markerType !== 'point-label'}
    bind:value={lineLength}
  >
</label>
<label>
  <input type="checkbox" bind:checked={showLanguage} />&nbsp;Show language name
</label>
<label>
  <input type="checkbox" bind:checked={showGloss} />&nbsp;Show gloss
</label>
{#if sets}
  <label>
    Headword:
    <select bind:value={headwordDisplay}>
      <option value="plain">Plain</option>
      <option value="reflex-bold">Reflex in bold</option>
      <option value="reflex-only">Reflex only</option>
    </select>
  </label>
{/if}
<button
  type="button"
  on:click={() => preferences.update({ mapView: getView() })}
>Save Map View</button>
<button
  type="button"
  on:click={() => updateView($preferences.mapView)}
  disabled={!$preferences.mapView}
>Restore Saved View</button>

<style lang="scss">
  label {
    margin-block-end: 6px;
  }

  button {
    align-self: flex-start;
    margin-block: 6px;
  }
</style>