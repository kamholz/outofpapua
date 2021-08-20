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
  const selected = Object.fromEntries(languages.map(({ language }) => [language.id, true]));
  $: selectedLanguages = languages.filter(({ language }) => selected[language.id]);

  function getLanguages(members) {
    const membersByLanguageCode = {};
    for (const member of members) {
      const { id } = member.language;
      if (!(id in membersByLanguageCode)) {
        const item = membersByLanguageCode[id] = {
          language: member.language,
          members: [member],
        };
        if (!Array.isArray(item.language.location)) {
          parseLanguageLocation(item.language);
        }
      } else {
        membersByLanguageCode[id].members.push(member);
      }
    }
    return Object.values(membersByLanguageCode).sort(sortFunction((v) => v.language.name.toLowerCase()));
  }
</script>

<div class="languages">
  {#each languages as { language } }
    <label>
      <input type="checkbox" bind:checked={selected[language.id]} />&nbsp;{language.name}
    </label>
  {/each}
</div>

<h2>Set map: {set.name_auto.txt}</h2>
<SetMap languages={selectedLanguages} />

<style lang="scss">
  .languages {
    height: 100px;
    display: inline-flex;
    flex-direction: column;
    flex-wrap: wrap;

    > label {
      margin-inline-end: 30px;
      margin-block-end: 6px;
    }
  }
</style>