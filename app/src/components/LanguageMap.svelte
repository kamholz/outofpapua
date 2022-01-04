<script>
  import FamilyIcon from '$components/LanguageMap/FamilyIcon.svelte';
  import Leaflet from '$components/LanguageMap/Leaflet.svelte';
  import Section from '$components/LanguageMap/Section.svelte';
  import Settings from '$components/LanguageMap/Settings.svelte';
  import { getContext } from 'svelte';
  import { parseLanguageLocation, sortFunction } from '$lib/util';
  const preferences = getContext('preferences');

  export let languages = null;
  export let { baseMap } = $preferences;
  export let showLanguageNames = true;
  export let lineLength = 3;

  parseLocations();
  const families = getFamilies();
  const languageMarkers = getLanguageMarkers();
  const familiesSorted = Object.values(families)
    .sort(sortFunction((v) => v.name.toLowerCase()));
  assignFamilyShapes();

  let updateFamily;

  function parseLocations() {
    for (const language of languages) {
      if (!Array.isArray(language.location)) {
        parseLanguageLocation(language);
      }
    }
  }

  function getFamilies() {
    const families = {};
    for (const language of languages) {
      const id = language.ancestor_id;
      if (!(id in families)) {
        families[id] = {
          id,
          name: language.ancestor_name.replace(/^proto-?/i, ''),
        };
      }
    }
    return families;
  }

  function assignFamilyShapes() {
    const shapes = ['circle', 'diamond', 'square', 'star', 'triangle'];
    let offset = 0;
    for (const family of familiesSorted) {
      family.shape = shapes[offset % shapes.length];
      offset++;
    }
  }

  function getLanguageMarkers() {
    return languages.map((language) => ({ language, marker: {} }))
      .sort(sortFunction(({ language }) => language.name.toLowerCase()));
  }
</script>

<div class="map">
  <div class="settings">
    <Section name="Settings">
      <Settings
        bind:baseMap
        bind:showLanguageNames
      />
    </Section>
    <Section name="Families">
      {#each familiesSorted as family (family.id)}
        <FamilyIcon
          {family}
          {updateFamily}
        />
      {/each}
    </Section>
  </div>

  <Leaflet
    {languages}
    {families}
    {languageMarkers}
    {baseMap}
    {showLanguageNames}
    {lineLength}
    bind:updateFamily
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
    }
  }
</style>