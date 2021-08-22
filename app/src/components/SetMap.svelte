<script>
  import 'leaflet/dist/leaflet.css';
  import LanguageMarker from '$components/SetMap/LanguageMarker.svelte';
  import { onDestroy, onMount } from 'svelte';

  export let languages;
  export let includeLanguageOnIcon;

  let L;
  let map = null;

  onMount(async () => {
    await loadLeaflet();

    map = L.map('map', {
      closePopupOnClick: false,
      scrollWheelZoom: false,
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
      ({ L } = window);
    } else {
      L = window.L = await import('leaflet');
      // await import('$lib/leaflet-svg-icon');
    }
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
    <LanguageMarker {L} {map} {language} {members} {includeLanguageOnIcon} />
  {/each}
{/if}

<style>
  div {
    height: 600px;
  }
</style>