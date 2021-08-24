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
  import { setContext } from 'svelte';

  export let set;
  const members = set.members.filter((v) => v.language.location);
  const selection = {};
  setContext('selection', selection);
  const languages = getLanguages(members);

  let includeLanguageOnLabel = false;
  let baseMap = 'esri-shaded-relief';
  let updateLanguage;

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
      selection[obj.language.id] = {
        language: true,
        headwords: Object.fromEntries(obj.headwords.map((headword) => [headword, true])),
      };
    }
    return languages;
  }
</script>

<h2>Set map: {set.name_auto.txt}</h2>
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
  <SetMap
    {languages}
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