<script>
  import Colors from '$components/SetMap/Colors.svelte';
  import Entries from './SetMap/Entries.svelte';
  import FamilyIcon from '$components/SetMap/FamilyIcon.svelte';
  import Leaflet from '$components/SetMap/Leaflet.svelte';
  import Section from '$components/SetMap/Section.svelte';
  import Settings from '$components/SetMap/Settings.svelte';
  import { fade } from 'svelte/transition';
  import { parseLanguageLocation, sortFunction } from '$lib/util';

  export let members;
  export let sets = null;
  const mappableMembers = members.filter(({ language }) => language.location);
  const languages = getLanguages();
  const families = getFamilies();
  const languageMarkers = getLanguageMarkers();
  const familiesSorted = Object.values(families)
    .sort(sortFunction((v) => v.name.toLowerCase()));

  let baseMap;
  let markerType = 'point-label';
  let showLanguage = false;
  let showGloss = false;
  let headwordDisplay = sets ? 'reflex-only' : 'plain';
  let lineLength = 3;
  let colorBy = 'origin';
  let colors = {
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

  function getLanguages() {
    const languages = {};
    for (const { language } of mappableMembers) {
      const { id } = language;
      if (!(id in languages)) {
        if (!Array.isArray(language.location)) {
          parseLanguageLocation(language);
        }
        languages[id] = { ...language, selected: true };
      }
    }
    return languages;
  }

  function getFamilies() {
    const families = {};
    for (const language of Object.values(languages)) {
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

  function getLanguageMarkers() {
    const markersByLanguageCode = {};
    for (const { entry, language: { id }, reflex, set_id, source: { ipa_conversion_rule } } of mappableMembers) {
      const key = sets ? set_id : 'all';
      if (!(id in markersByLanguageCode)) {
        markersByLanguageCode[id] = {
          language: languages[id],
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

      markersByLanguageCode[id].markers[key].entries.push({
        ...entry,
        ipa_conversion_rule,
        reflex, set_id,
        selected: true,
      });
    }

    const languageMarkers = Object.values(markersByLanguageCode);
    languageMarkers.sort(sortFunction(({ language }) => language.name.toLowerCase()));

    for (const lm of languageMarkers) {
      lm.markers = Object.values(lm.markers);
      for (const marker of lm.markers) {
        marker.entries.sort(sortFunction((v) => v.headword.toLowerCase()));
      }
      lm.entries = [].concat(...lm.markers.map(({ entries }) => entries))
        .sort(sortFunction(({ headword }) => headword.toLowerCase()));
    }
  
    return languageMarkers;
  }
</script>

<div class="map">
  <div class="settings">
    <Section name="Settings">
      <Settings
        bind:baseMap
        bind:markerType
        bind:lineLength
        bind:showLanguage
        bind:showGloss
        bind:headwordDisplay
        {sets}
        {getView}
        {updateView}
      />
    </Section>
    <Section name="Colors">
      <Colors
        bind:colorBy
        bind:colors
        {sets}
      />
    </Section>
    {#if markerType !== 'label'}
      <div transition:fade|local>
        <Section name="Families">
          {#each familiesSorted as family (family.id)}
            <FamilyIcon
              {family}
              {updateFamily}
            />
          {/each}
        </Section>
      </div>
    {/if}
    <Section name="Languages">
      {#each languageMarkers as { entries, language } }
        <label>
          <input
            type="checkbox"
            bind:checked={language.selected}
            on:change={() => updateLanguage(language.id)}
          />&nbsp;{language.name}
        </label>
        <Entries
          {entries}
          {language}
          {updateLanguage}
        />
      {/each}
    </Section>
  </div>

  <Leaflet
    {languages}
    {families}
    {languageMarkers}
    {baseMap}
    {markerType}
    {showLanguage}
    {showGloss}
    {headwordDisplay}
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
      margin-block-start: 6px;

      label {
        margin-block-end: 6px;
      }
    }
  }
</style>