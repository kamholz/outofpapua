<script>
  import EntryMapLeaflet from '$components/EntryMap/Leaflet.svelte';
  import { parseLanguageLocation, sortFunction } from '$lib/util';
  import { setContext } from 'svelte';

  export let items;
  export let getEntry;
  const selection = {};
  setContext('selection', selection);
  const languages = getLanguages(items.filter((item) => item.language.location));

  let markerType = 'point-label';
  let includeLanguageOnLabel = false;
  let baseMap = 'esri-shaded-relief';
  let updateLanguage;

  function getLanguages(items) {
    const itemsByLanguageCode = {};
    for (const item of items) {
      const { language } = item;
      const { id } = language;
      const entry = getEntry(item);
      if (!(id in itemsByLanguageCode)) {
        itemsByLanguageCode[id] = {
          language,
          entries: [entry],
          headwords: new Set([entry.headword]),
        };
        if (!Array.isArray(language.location)) {
          parseLanguageLocation(language);
        }
      } else {
        itemsByLanguageCode[id].entries.push(entry);
        itemsByLanguageCode[id].headwords.add(entry.headword);
      }
    }

    const languages = Object.values(itemsByLanguageCode);
    languages.sort(sortFunction(({ language }) => language.name.toLowerCase()));
    for (const obj of languages) {
      obj.headwords = [...obj.headwords].sort(sortFunction((v) => v.toLowerCase()));
      selection[obj.language.id] = {
        language: true,
        headwords: Object.fromEntries(obj.headwords.map((headword) => [headword, true])),
      };
    }
    return languages;
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
        <option value="esri-shaded-relief">Esri Shaded Relief</option>
        <option value="esri-topo">Esri Topo</option>
      </select>
    </label>
    <label>
      Label:
      <select bind:value={markerType}>
        <option value="point-label">Point with label</option>
        <option value="point">Point only</option>
        <option value="label">Label only</option>
      </select>
    </label>
    <h3>Languages</h3>
    {#each languages as { headwords, language } }
      <label>
        <input
          type="checkbox"
          bind:checked={selection[language.id].language}
          on:change={() => updateLanguage(language.id)}
        />&nbsp;{language.name}
      </label>
      {#if headwords.length > 1}
        {#each headwords as headword }
          <label class="headword">
            <input
              type="checkbox"
              bind:checked={selection[language.id].headwords[headword]}
              on:change={() => updateLanguage(language.id)}
              disabled={
                !selection[language.id] ||
                ( // only one selected headword left for this language
                  Object.values(selection[language.id].headwords).filter((v) => v).length === 1 &&
                  selection[language.id].headwords[headword]
                )
              }
            />&nbsp;{headword}
          </label>
        {/each}
      {/if}
    {/each}
  </div>
  <EntryMapLeaflet
    {languages}
    {markerType}
    {includeLanguageOnLabel}
    {baseMap}
    bind:updateLanguage
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