<script>
  import SetMapLeaflet from '$components/SetMap/Leaflet.svelte';
  import Svelecte from '$lib/svelecte';
  import { fade } from 'svelte/transition';
  import { getContext } from 'svelte';
  import { parseLanguageLocation, sortFunction } from '$lib/util';

  export let members;
  export let sets = null;
  const preferences = getContext('preferences');
  const mappableMembers = members.filter(({ language }) => language.location);
  const languageMarkers = getLanguageMarkers(mappableMembers);
  const families = getFamilies(languageMarkers);
  const familiesSorted = Object.keys(families)
    .sort(sortFunction((v) => families[v].name.toLowerCase()))
    .map((v) => families[v]);

  let { baseMap } = $preferences;
  let markerType = 'point-label';
  let includeLanguage = false;
  let showGloss = false;
  let lineLength = 3;
  let colorBy = 'origin';
  const colors = {
    origin: {
      borrowed: '#dc143c',
      inherited: '#800080',
      unknown: '#000000',
    },
  };

  if (sets) {
    sets.sort(sortFunction((v) => v.name_auto.txt.toLowerCase()));
    colors.set = Object.fromEntries(sets.map((set) => [set.id, '#000000']));
  }

  let updateLanguage;
  let updateFamily;
  let updateView;
  let getView;

  function getLanguageMarkers(members) {
    const markersByLanguageCode = {};
    for (const { entry, language, reflex, set_id } of members) {
      const { id } = language;
      const key = sets ? set_id : 'all';
      if (!(id in markersByLanguageCode)) {
        if (!Array.isArray(language.location)) {
          parseLanguageLocation(language);
        }
        markersByLanguageCode[id] = {
          language,
          markers: {
            [key]: {
              entries: [],
            },
          },
        };
      } else if (!(key in markersByLanguageCode[id].markers)) {
        markersByLanguageCode[id].markers[key] = {
          entries: [],
        };
      }

      markersByLanguageCode[id].markers[key].entries.push({ ...entry, reflex, set_id });
    }

    const languageMarkers = Object.values(markersByLanguageCode);
    languageMarkers.sort(sortFunction(({ language }) => language.name.toLowerCase()));

    for (const lm of languageMarkers) {
      lm.markers = Object.values(lm.markers);
      for (const marker of lm.markers) {
        marker.entries.sort(sortFunction((v) => v.headword.toLowerCase()));
        marker.headwords = [...new Set(marker.entries.map(({ headword }) => headword))]
          .sort(sortFunction((v) => v.toLowerCase()));
      }
      lm.entries = [].concat(...lm.markers.map(({ entries }) => entries))
        .sort(sortFunction(({ headword }) => headword.toLowerCase()));
      lm.headwords = [...new Set([].concat(...lm.markers.map((v) => v.headwords)))]
        .sort(sortFunction((v) => v.toLowerCase()));
      lm.selection = {
        language: true,
        entries: {},
        headwords: {},
      };
      for (const marker of lm.markers) {
        for (const { id, headword } of marker.entries) {
          lm.selection.entries[id] = true;
          if (!(headword in lm.selection.headwords)) {
            lm.selection.headwords[headword] = {
              ids: [],
              state: true,
            };
          }
          lm.selection.headwords[headword].ids.push(id);
        }
      }
    }
  
    console.log(languageMarkers);
    return languageMarkers;
  }

  function getFamilies(languageMarkers) {
    const families = {};
    for (const { language } of languageMarkers) {
      if (!(language.ancestor_id in families)) {
        families[language.ancestor_id] = {
          id: language.ancestor_id,
          name: language.ancestor_name.replace(/^proto-?/i, ''),
          shape: 'circle',
        };
      }
    }
    return families;
  }

  function selectHeadword(selection, headword, languageId) {
    const state = selection.headwords[headword].state;
    for (const id of selection.headwords[headword].ids) {
      selection.entries[id] = state;
    }
    updateLanguage(languageId);
  }
</script>

<div class="map">
  <div class="settings">
    <h3>Settings</h3>
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
      <input type="checkbox" bind:checked={includeLanguage} />&nbsp;Include language name
    </label>
    <label>
      <input type="checkbox" bind:checked={showGloss} />&nbsp;Show gloss
    </label>
    <button
      type="button"
      on:click={() => preferences.update({ mapView: getView() })}
    >Save Map View</button>
    <button
      type="button"
      on:click={() => updateView($preferences.mapView)}
      disabled={!$preferences.mapView}
    >Restore Saved View</button>
    <h3>Colors</h3>
    {#if sets}
      <span class="radios">
        <label>
          <input
            type="radio"
            name="color_by"
            value="origin"
            checked={colorBy === 'origin'}
            bind:group={colorBy}
          >
          By origin
        </label>
        <label>
          <input
            type="radio"
            name="color_by"
            value="set"
            checked={colorBy === 'set'}
            bind:group={colorBy}
          >
          By set
        </label>
      </span>
    {/if}
    {#if colorBy === 'origin'}
      <div in:fade|local>
        <label class="color">
          Borrowed:
          <input type="color" bind:value={colors.origin.borrowed} />
        </label>
        <label class="color">
          Inherited:
          <input type="color" bind:value={colors.origin.inherited} />
        </label>
        <label class="color">
          Unknown:
          <input type="color" bind:value={colors.origin.unknown} />
        </label>
      </div>
    {:else}
      <div in:fade|local>
        {#each sets as set}
          <label class="color">
            {set.name_auto.txt}:
            <input type="color" bind:value={colors.set[set.id]} />
          </label>
        {/each}
      </div>
    {/if}

    {#if markerType !== 'label'}
      <div transition:fade|local>
        <h3>Families</h3>
        {#each familiesSorted as family }
          <span class="family">
            {family.name}:
            <Svelecte
              options={['circle', 'diamond', 'square', 'star', 'triangle'].map((value) => ({ value }))}
              valueField="value"
              labelField="value"
              searchable={false}
              renderer={(item) => `<svg viewBox="0 0 16 16"><use href="/icons.svg#${item.value}" /></svg>`}
              bind:value={family.shape}
              on:change={updateFamily(family.id)}
            />
          </span>
        {/each}
      </div>
    {/if}

    <h3>Languages</h3>
    {#each languageMarkers as { entries, headwords, language, selection } }
      <label>
        <input
          type="checkbox"
          bind:checked={selection.language}
          on:change={() => updateLanguage(language.id)}
        />&nbsp;{language.name}
      </label>
      {#if showGloss}
        fix me
      {:else}
        {#if headwords.length > 1}
          {#each headwords as headword}
            <label class="headword">
              <input
                type="checkbox"
                bind:checked={selection.headwords[headword].state}
                on:change={() => selectHeadword(selection, headword, language.id)}
                disabled={
                  !selection.language ||
                  ( // only one selected headword left for this language
                    selection.headwords[headword].state &&
                    Object.values(selection.headwords).filter(({ state }) => state).length === 1
                  )
                }
              />&nbsp;{headword}
            </label>
          {/each}
        {/if}
      {/if}
    {/each}

  </div>
  <SetMapLeaflet
    {languageMarkers}
    {families}
    {baseMap}
    {markerType}
    {includeLanguage}
    {showGloss}
    {lineLength}
    {colorBy}
    {colors}
    bind:updateLanguage
    bind:updateFamily
    bind:updateView
    bind:getView
  />
</div>

<style lang="scss">
  .map {
    display: flex;

    .settings {
      display: flex;
      flex-direction: column;
      inline-size: 16em;
      margin-inline-end: 20px;

      label {
        margin-block-end: 6px;

        &.headword {
          margin-inline-start: 20px;
        }

        &.color {
          display: flex;
          align-items: center;
          justify-content: space-between;
          inline-size: 8.5em;
        }
      }

      input[type="color"] {
        flex-shrink: 0;
      }

      button {
        align-self: flex-start;
        margin-block: 6px;
      }

      .radios {
        display: flex;
        align-items: center;
        margin-block-end: 16px;
        > label {
          margin-inline-end: 8px;
        }
      }

      .family {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-block-end: 10px;
      }
    }

    :global {
      .svelecte {
        flex: unset;
      }

      .sv-control {
        inline-size: 70px;
        .sv-item-content {
          margin-inline-start: 8px;
        }
      }

      .sv-item-content {
        width: 16px;
        height: 16px;
      }

      .sv-dropdown {
        inline-size: 50px;
        .sv-item {
          display: flex;
          justify-content: space-around;
        }
      }
    }
  }
</style>