<script>
  import SetMapLeaflet from '$components/SetMap/Leaflet.svelte';
  import Svelecte from '$lib/svelecte';
  import { parseLanguageLocation, sortFunction } from '$lib/util';

  export let members;
  const languages = getLanguages(members.filter(({ language }) => language.location));
  const families = getFamilies(languages);
  const familiesSorted = Object.keys(families)
    .sort(sortFunction((v) => families[v].name.toLowerCase()))
    .map((v) => families[v]);

  let markerType = 'point-label';
  let includeLanguageOnLabel = false;
  let baseMap = 'cartodb-positron';
  let lineLength = 3;
  let updateLanguage;
  let updateFamily;

  function getLanguages(members) {
    const membersByLanguageCode = {};
    for (const { entry, language, reflex } of members) {
      const { id } = language;
      if (!(id in membersByLanguageCode)) {
        membersByLanguageCode[id] = {
          language,
          entries: [{ ...entry, reflex }],
          headwords: new Set([entry.headword]),
        };
        if (!Array.isArray(language.location)) {
          parseLanguageLocation(language);
        }
      } else {
        membersByLanguageCode[id].entries.push({ ...entry, reflex });
        membersByLanguageCode[id].headwords.add(entry.headword);
      }
    }

    const languages = Object.values(membersByLanguageCode);
    languages.sort(sortFunction(({ language }) => language.name.toLowerCase()));
    for (const obj of languages) {
      obj.headwords = [...obj.headwords].sort(sortFunction((v) => v.toLowerCase()));
      obj.selection = {
        language: true,
        headwords: Object.fromEntries(obj.headwords.map((headword) => [headword, true])),
      };
    }
    return languages;
  }

  function getFamilies(languages) {
    const families = {};
    for (const { language } of languages) {
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
</script>

<div class="map">
  <div class="settings">
    <h3>Settings</h3>
    <label>
      Base map:
      <select bind:value={baseMap}>
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
      <input type="checkbox" bind:checked={includeLanguageOnLabel} />&nbsp;Include language name
    </label>
    <h3>Languages</h3>
    {#each languages as { headwords, language, selection } }
      <label>
        <input
          type="checkbox"
          bind:checked={selection.language}
          on:change={() => updateLanguage(language.id)}
        />&nbsp;{language.name}
      </label>
      {#if headwords.length > 1}
        {#each headwords as headword }
          <label class="headword">
            <input
              type="checkbox"
              bind:checked={selection.headwords[headword]}
              on:change={() => updateLanguage(language.id)}
              disabled={
                !selection.language ||
                ( // only one selected headword left for this language
                  Object.values(selection.headwords).filter((v) => v).length === 1 &&
                  selection.headwords[headword]
                )
              }
            />&nbsp;{headword}
          </label>
        {/each}
      {/if}
    {/each}
    <h3>Families</h3>
    {#each familiesSorted as family }
      <span>
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
  <SetMapLeaflet
    {languages}
    {families}
    {markerType}
    {includeLanguageOnLabel}
    {baseMap}
    {lineLength}
    bind:updateLanguage
    bind:updateFamily
  />
</div>

<style lang="scss">
  .map {
    display: flex;

    .settings {
      display: flex;
      flex-direction: column;
      inline-size: 14em;
      margin-inline-end: 20px;

      > label {
        margin-block-end: 6px;

        &.headword {
          margin-inline-start: 20px;
        }
      }
    }

    :global {
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