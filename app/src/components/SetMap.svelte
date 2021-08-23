<script>
  import 'leaflet/dist/leaflet.css';
  import LanguageMarker from '$components/SetMap/LanguageMarker.svelte';
  import { onDestroy, onMount } from 'svelte';

  export let languages;
  export let selectedLanguages;
  export let includeLanguageOnIcon;
  export let baseMap;

  let L;
  let map = null;

  const baseMaps = {
    'esri-shaded-relief': {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri',
    },
    'esri-terrain': {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
    },
    'esri-topo': {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
    },
  };

  $: if (map && baseMap) {
    map.eachLayer((layer) => layer.remove());
    L.tileLayer(baseMaps[baseMap].url, {
      attribution: baseMaps[baseMap].attribution,
      // tileSize: 256,
     }).addTo(map);
    map = map;
  }

  onMount(async () => {
    await loadLeaflet();

    map = L.map('map', {
      closePopupOnClick: false,
      scrollWheelZoom: false,
      zoomDelta: 0.5,
      zoomSnap: 0.5,
    })
    .fitBounds(getBounds(languages));
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
  {#each languages as { entries, headwords, language } (language.id)}
    {#if selectedLanguages[language.id].language}
      <LanguageMarker
        {L}
        {map}
        {entries}
        headwords={headwords.filter((headword) => selectedLanguages[language.id].headwords[headword])}
        {language}
        {includeLanguageOnIcon}
      />
    {/if}
  {/each}
{/if}

<style>
  div {
    width: 100%;
    height: 600px;
  }
</style>