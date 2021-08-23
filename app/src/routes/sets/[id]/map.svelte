<script context="module">
  export const ssr = false;

  export async function load({ fetch, page: { params } }) {
    const props = {};

    props.set = await reload(fetch, Number(params.id));
    if (!props.set) {
      return { status: 404 };
    }

    return { props };
  }

  async function reload(fetch, id) {
    const res = await fetch(`/api/set/${id}.json`);
    return res.ok ? res.json() : null;
  }
</script>

<script>
  import SetMap from '$components/SetMap.svelte';
  import { parseLanguageLocation, sortFunction } from '$lib/util';

  export let set;
  const members = set.members.filter((v) => v.language.location);
  const languages = getLanguages(members);
  const selectedLanguages = Object.fromEntries(languages.map(({ headwords, language }) =>
    [
      language.id,
      {
        language: true,
        headwords: Object.fromEntries(headwords.map((headword) => [headword, true])),
      },
    ]
  ));

  let includeLanguageOnIcon = false;
  let baseMap = 'esri-terrain';

  function getLanguages(members) {
    const membersByLanguageCode = {};
    for (const { entry, language } of members) {
      const { id } = language;
      if (!(id in membersByLanguageCode)) {
        const item = membersByLanguageCode[id] = {
          language,
          entries: [entry],
          headwords: new Set([entry.headword]),
        };
        if (!Array.isArray(item.language.location)) {
          parseLanguageLocation(item.language);
        }
      } else {
        membersByLanguageCode[id].entries.push(entry);
        membersByLanguageCode[id].headwords.add(entry.headword);
      }
    }

    const languages = Object.values(membersByLanguageCode);
    languages.sort(sortFunction(({ language }) => language.name.toLowerCase()));
    for (const obj of languages) {
      obj.headwords = [...obj.headwords].sort(sortFunction((v) => v.toLowerCase()));
    }
    return languages;
  }
</script>

<h2>Set map: {set.name_auto.txt}</h2>
<div class="map">
  <div class="settings">
    <h3>Settings</h3>
    <label>
      <input type="checkbox" bind:checked={includeLanguageOnIcon} />&nbsp;Include language name
    </label>
    <label>
      Base map:
      <select bind:value={baseMap}>
        <option value="esri-shaded-relief">Esri Shaded Relief</option>
        <option value="esri-terrain">Esri Terrain</option>
        <option value="esri-topo">Esri Topo</option>
      </select>
    </label>
    <h3>Languages</h3>
    {#each languages as { headwords, language } }
      <label>
        <input
          type="checkbox"
          bind:checked={selectedLanguages[language.id].language}
        />&nbsp;{language.name}
      </label>
      {#if headwords.length > 1}
        {#each headwords as headword }
          <label class="headword">
            <input
              type="checkbox"
              bind:checked={selectedLanguages[language.id].headwords[headword]}
              disabled={
                !selectedLanguages[language.id].language ||
                ( // only one selected headword left for this language
                  Object.values(selectedLanguages[language.id].headwords).filter((v) => v).length === 1 &&
                  selectedLanguages[language.id].headwords[headword]
                )
              }
            />&nbsp;{headword}
          </label>
        {/each}
      {/if}
    {/each}
  </div>
  <SetMap
    {languages}
    {selectedLanguages}
    {includeLanguageOnIcon}
    {baseMap}
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