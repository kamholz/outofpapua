<script>
  import EntryMapLeaflet from '$components/EntryMap/Leaflet.svelte';
  import { parseLanguageLocation, sortFunction } from '$lib/util';

  export let entries;
  const languages = getLanguages(entries.filter((entry) => entry.language.location));
  const families = getFamilies(languages);
  const familiesSorted = Object.keys(families)
    .sort(sortFunction((v) => families[v].name.toLowerCase()))
    .map((v) => families[v]);

  let markerType = 'point-label';
  let includeLanguageOnLabel = false;
  let baseMap = 'esri-gray-canvas';
  let updateLanguage;
  let updateFamily;

  function getLanguages(entries) {
    const entriesByLanguageCode = {};
    for (const entry of entries) {
      const { language } = entry;
      const { id } = language;
      if (!(id in entriesByLanguageCode)) {
        entriesByLanguageCode[id] = {
          language,
          entries: [entry],
          headwords: new Set([entry.headword]),
        };
        if (!Array.isArray(language.location)) {
          parseLanguageLocation(language);
        }
      } else {
        entriesByLanguageCode[id].entries.push(entry);
        entriesByLanguageCode[id].headwords.add(entry.headword);
      }
    }

    const languages = Object.values(entriesByLanguageCode);
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
          name: language.ancestor_name,
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
      <input type="checkbox" bind:checked={includeLanguageOnLabel} />&nbsp;Include language name
    </label>
    <label>
      Base map:
      <select bind:value={baseMap}>
        <option value="esri-gray-canvas">Gray Canvas</option>
        <option value="esri-shaded-relief">Shaded Relief</option>
        <option value="esri-topo">Topo</option>
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
      <label>
        {family.name}:
        <select bind:value={family.shape} on:change={updateFamily(family.id)}>
          <option value="circle">Circle</option>
          <option value="diamond">Diamond</option>
          <option value="square">Square</option>
          <option value="star">Star</option>
          <option value="triangle">Triangle</option>
        </select>
      </label>
    {/each}

  </div>
  <EntryMapLeaflet
    {languages}
    {families}
    {markerType}
    {includeLanguageOnLabel}
    {baseMap}
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
  }
</style>