<script>
  import Colors from '$components/SetMap/Colors.svelte';
  import Entries from './SetMap/Entries.svelte';
  import FamilyIcon from '$components/SetMap/FamilyIcon.svelte';
  import Leaflet from '$components/SetMap/Leaflet.svelte';
  import SaveRestore from '$components/SetMap/SaveRestore.svelte';
  import Section from '$components/SetMap/Section.svelte';
  import Settings from '$components/SetMap/Settings.svelte';
  import { fade } from 'svelte/transition';
  import { getContext } from 'svelte';
  import { pageLoading } from '$lib/stores';
  import { parseLanguageLocation, sortFunction } from '$lib/util';
  import * as crud from '$actions/crud';
  const preferences = getContext('preferences');

  export let entries = null;
  export let sets = null;
  export let name = null;
  export let selection = null;

  export let { baseMap } = $preferences;
  export let view = null;
  export let markerType = 'point-label';
  export let showLanguage = false;
  export let showGloss = false;
  export let headwordDisplay = sets ? 'reflex-only' : 'plain';
  export let lineLength = 3;
  export let colorBy = 'origin';
  export let colors = {
    origin: {
      borrowed: '#dc143c',
      inherited: '#800080',
      unknown: '#000000',
    },
  };
  export let familyIcon = null;

  if (sets?.length > 1) {
    sets.sort(sortFunction((v) => v.name_auto.txt.toLowerCase()));
    colors.set = Object.fromEntries(sets.map((set) => [set.id, '#000000']));
  }

  const members = getMembers();
  const languages = getLanguages();
  const families = getFamilies();
  const languageMarkers = getLanguageMarkers();
  const familiesSorted = Object.values(families)
    .sort(sortFunction((v) => v.name.toLowerCase()));

  let updateLanguage;
  let updateFamily;
  let getView;
  let setView;

  function getMembers() {
    let members;
    if (sets) {
      if (sets.length === 1) {
        [{ members }] = sets;
      } else {
        members = [].concat(...sets.map((set) => set.members.map((member) => ({ ...member, set_id: set.id }))));
      }
    } else {
      members = entries.map((entry) => ({
        entry,
        language: entry.language,
        source: entry.source,
      }));
    }
    return members.filter(({ language }) => language.location);
  }

  function getLanguages() {
    const sel = selection?.language;
    const languages = {};
    for (const { language } of members) {
      const { id } = language;
      if (!(id in languages)) {
        if (!Array.isArray(language.location)) {
          parseLanguageLocation(language);
        }
        languages[id] = { ...language, selected: sel?.[id] ?? true };
      }
    }
    return languages;
  }

  function getFamilies() {
    const families = {};
    for (const language of Object.values(languages)) {
      const id = language.ancestor_id;
      if (!(id in families)) {
        families[id] = {
          id,
          name: language.ancestor_name.replace(/^proto-?/i, ''),
          shape: familyIcon?.[id] ?? 'circle',
        };
      }
    }
    return families;
  }

  function getLanguageMarkers() {
    const sel = selection?.entry;
    const markersByLanguageCode = {};
    for (const { entry, language: { id }, reflex, set_id, source: { ipa_conversion_rule } } of members) {
      const key = sets?.length > 1 ? set_id : 'all';
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
        selected: sel?.[entry.id] ?? true,
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

  async function handleSave() {
    const data = serialize();
    $pageLoading++;
    try {
      const { id } = await crud.create('saved_map', { name, data });
      const params = new URLSearchParams(window.location.search);
      params.set('id', id);
      window.history.replaceState(null, '', '?' + params.toString());
    } catch (e) {}
    $pageLoading--;
  }

  function serialize() {
    const data = {
      sets: null,
      entries: null,
      settings: {
        baseMap,
        view: getView(),
        markerType,
        showLanguage,
        showGloss,
        headwordDisplay,
        lineLength,
        colorBy,
        colors,
        familyIcon: Object.fromEntries(familiesSorted.map((v) => [v.id, v.shape])),
      },
    };

    if (sets) {
      data.sets = sets.map((v) => v.id);
    } else {
      data.entries = entries.map((v) => v.id);
    }

    const selection = {
      language: {},
      entry: {},
    };

    for (const { id, selected } of Object.values(languages)) {
      selection.language[id] = selected;
    }
    for (const { markers } of languageMarkers) {
      for (const { entries } of markers) {
        for (const { id, selected } of entries) {
          selection.entry[id] = selected;
        }
      }
    }
    data.settings.selection = selection;

    return data;
  }
</script>

<div class="map">
  <div class="settings">
    <Section name="Save and Restore" collapsed>
      <SaveRestore
        {getView}
        {setView}
        bind:name
        on:save={handleSave}
      />
    </Section>
    <Section name="Settings">
      <Settings
        bind:baseMap
        bind:markerType
        bind:lineLength
        bind:showLanguage
        bind:showGloss
        bind:headwordDisplay
        headwordOptions={Boolean(sets)}
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
    {view}
    {markerType}
    {showLanguage}
    {showGloss}
    {headwordDisplay}
    {lineLength}
    {colorBy}
    {colors}
    bind:updateLanguage
    bind:updateFamily
    bind:getView
    bind:setView
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