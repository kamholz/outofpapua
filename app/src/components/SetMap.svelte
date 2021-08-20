<script>
  import 'leaflet/dist/leaflet.css';
  import LanguageMarker from '$components/SetMap/LanguageMarker.svelte';
  import { parseLanguageLocation } from '$lib/util';
  import { onDestroy, onMount } from 'svelte';

  export let set;
  $: members = set.members.filter((v) => v.language.location);
  $: languages = getLanguages(members);

  let L;
  let map = null;

  onMount(async () => {
    await loadLeaflet();

    map = L.map('map', {
      closePopupOnClick: false,
    })
    .fitBounds(getBounds(languages));

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      tileSize: 256,
    }).addTo(map);
  });

  onDestroy(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });

  async function loadLeaflet() {
    if (window.L) {
      L = window.L;
    } else {
      L = window.L = await import('leaflet');
      await import('$lib/leaflet-svg-icon');
    }
  }

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
    return Object.values(membersByLanguageCode);
  }

  function getBounds(languages) {
    const locations = languages.map(({ language }) => language.location);
    return [
      [
        Math.min(...locations.map((v) => v[0])),
        Math.min(...locations.map((v) => v[1])),
      ],
      [
        Math.max(...locations.map((v) => v[0])),
        Math.max(...locations.map((v) => v[1])),
      ],
    ];
  }
</script>

<div id="map"></div>

{#if map}
  {#each languages as { language, members } (language.id)}
    <LanguageMarker {L} {map} {language} {members} />
  {/each}
{/if}

<style>
  div {
    height: 600px;
  }
</style>